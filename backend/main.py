"""
FastAPI Backend for Industrial Predictive Maintenance System
Real-time signal processing pipeline with WebSocket support
"""

import asyncio
import json
from datetime import datetime
from typing import List, Dict
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from models import (
    MachineReading, MachineState, SystemStatus, MachineStatus,
    AnomalyAlert, RULPrediction
)
from engine import (
    MachineSimulator, ValidationBuffer, AnomalyDetectionEngine,
    RULPredictionEngine, AIAssistant, VoiceAlertModule
)


# Initialize FastAPI app
app = FastAPI(
    title="Industrial Predictive Maintenance System",
    description="Real-time monitoring and anomaly detection for industrial machines",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Initialize core components
simulator = MachineSimulator(window_size=100)
validation_buffer = ValidationBuffer(buffer_size=3)
anomaly_detector = AnomalyDetectionEngine(validation_buffer)
rul_predictor = RULPredictionEngine()
ai_assistant = AIAssistant()
voice_alert = VoiceAlertModule()

# Store machine states
machine_states: Dict[str, MachineState] = {}
machine_lock = asyncio.Lock()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                disconnected.append(connection)
        
        # Remove disconnected clients
        for conn in disconnected:
            if conn in self.active_connections:
                self.active_connections.remove(conn)


manager = ConnectionManager()


# Background task to generate readings
async def generate_readings_background():
    """Background task to continuously generate machine readings"""
    while True:
        async with machine_lock:
            for machine_id in simulator.machines:
                # Generate reading
                reading = simulator.generate_reading(machine_id)
                
                # Get window data
                window_data = simulator.get_window_data(machine_id)
                
                # Detect anomalies
                anomaly_alerts = anomaly_detector.detect_anomalies(machine_id, reading, window_data)
                
                # Predict RUL
                rul_predictions = rul_predictor.predict_rul(machine_id, window_data)
                
                # Determine overall status
                status = MachineStatus.NORMAL
                if any(alert.severity == MachineStatus.CRITICAL for alert in anomaly_alerts):
                    status = MachineStatus.CRITICAL
                elif any(alert.severity == MachineStatus.WARNING for alert in anomaly_alerts):
                    status = MachineStatus.WARNING
                
                # Generate AI explanations for alerts
                enriched_alerts = []
                for alert in anomaly_alerts:
                    explanation = ai_assistant.generate_explanation(alert)
                    enriched_alerts.append({
                        "alert": alert.dict(),
                        "explanation": explanation
                    })
                    
                    # Trigger voice alert for critical anomalies
                    if alert.severity == MachineStatus.CRITICAL:
                        voice_alert.speak_alert(alert, explanation)
                
                # Update machine state
                machine_states[machine_id] = MachineState(
                    machine_id=machine_id,
                    latest_reading=reading,
                    status=status,
                    anomaly_alerts=anomaly_alerts,
                    rul_predictions=rul_predictions,
                    window_size=100,
                    current_window_size=len(window_data["temperature"])
                )
                
                # Broadcast update via WebSocket
                await manager.broadcast({
                    "type": "machine_update",
                    "machine_id": machine_id,
                    "reading": reading.dict(),
                    "status": status.value,
                    "anomalies": enriched_alerts,
                    "rul_predictions": [rul.dict() for rul in rul_predictions]
                })
        
        # Wait before next reading (1 second)
        await asyncio.sleep(1)


# REST API Endpoints

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Industrial Predictive Maintenance System API",
        "version": "1.0.0",
        "endpoints": {
            "status": "/status",
            "machines": "/machines",
            "machine_detail": "/machines/{machine_id}",
            "websocket": "/ws"
        }
    }


@app.get("/status")
async def get_system_status():
    """Get overall system status for all machines"""
    async with machine_lock:
        total_machines = len(simulator.machines)
        active_machines = len(machine_states)
        
        # Determine system health
        critical_count = sum(
            1 for state in machine_states.values()
            if state.status == MachineStatus.CRITICAL
        )
        warning_count = sum(
            1 for state in machine_states.values()
            if state.status == MachineStatus.WARNING
        )
        
        if critical_count > 0:
            system_health = "critical"
        elif warning_count > 0:
            system_health = "degraded"
        else:
            system_health = "healthy"
        
        return SystemStatus(
            timestamp=datetime.utcnow(),
            total_machines=total_machines,
            active_machines=active_machines,
            machines={mid: state.dict() for mid, state in machine_states.items()},
            system_health=system_health
        ).dict()


@app.get("/machines")
async def get_all_machines():
    """Get list of all machines and their current states"""
    async with machine_lock:
        return {
            "machines": list(simulator.machines),
            "states": {mid: state.dict() for mid, state in machine_states.items()}
        }


@app.get("/machines/{machine_id}")
async def get_machine_detail(machine_id: str):
    """Get detailed information for a specific machine"""
    if machine_id not in simulator.machines:
        raise HTTPException(status_code=404, detail="Machine not found")
    
    async with machine_lock:
        if machine_id not in machine_states:
            raise HTTPException(status_code=404, detail="No data available for this machine yet")
        
        state = machine_states[machine_id]
        window_data = simulator.get_window_data(machine_id)
        
        return {
            "machine_id": machine_id,
            "state": state.dict(),
            "window_data": {
                "temperature": list(window_data["temperature"]),
                "vibration": list(window_data["vibration"]),
                "rpm": list(window_data["rpm"]),
                "current": list(window_data["current"]),
                "timestamps": [t.isoformat() for t in window_data["timestamps"]]
            }
        }


@app.post("/machines/{machine_id}/reset")
async def reset_machine(machine_id: str):
    """Reset machine drift state (simulating maintenance)"""
    if machine_id not in simulator.machines:
        raise HTTPException(status_code=404, detail="Machine not found")
    
    simulator.reset_drift(machine_id)
    validation_buffer.reset_buffer(machine_id)
    
    return {
        "message": f"Machine {machine_id} has been reset",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/voice/toggle")
async def toggle_voice_alerts(enabled: bool):
    """Enable or disable voice alerts"""
    voice_alert.set_enabled(enabled)
    return {
        "message": f"Voice alerts {'enabled' if enabled else 'disabled'}",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/voice/status")
async def get_voice_status():
    """Get voice alert status"""
    return {
        "enabled": voice_alert.enabled,
        "available": voice_alert.engine is not None
    }


# WebSocket Endpoint

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time machine updates"""
    await manager.connect(websocket)
    try:
        # Send initial state
        async with machine_lock:
            for machine_id, state in machine_states.items():
                await websocket.send_json({
                    "type": "machine_update",
                    "machine_id": machine_id,
                    "reading": state.latest_reading.dict(),
                    "status": state.status.value,
                    "anomalies": [],
                    "rul_predictions": [rul.dict() for rul in state.rul_predictions]
                })
        
        # Keep connection alive and handle incoming messages
        while True:
            data = await websocket.receive_text()
            # Echo back or handle client messages if needed
            try:
                message = json.loads(data)
                if message.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
            except:
                pass
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# Startup event to begin background task
@app.on_event("startup")
async def startup_event():
    """Start the background reading generation task"""
    asyncio.create_task(generate_readings_background())


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    pass


if __name__ == "__main__":
    # Run the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
