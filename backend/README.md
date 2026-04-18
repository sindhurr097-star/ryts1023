# Industrial Predictive Maintenance System

A real-time signal processing pipeline for industrial machine monitoring, anomaly detection, and failure prediction using FastAPI, WebSockets, and advanced signal processing techniques.

## Architecture Overview

This system is designed with an ECE (Electrical and Computer Engineering) perspective, treating machine data as signals that require noise filtering and validation before analysis.

### Signal Processing Philosophy

**Signal vs. Noise Distinction:**
- **Transient Noise**: Single high reading (ignored)
- **Suspected Signal**: 2 consecutive high readings (monitored)
- **Genuine Failure Signal**: 3 consecutive high readings (triggers alert)

This is implemented using a **3-reading validation buffer** that prevents false positives from sensor noise while catching genuine failures.

### Folder Structure

```
backend/
├── main.py           # FastAPI application with WebSocket endpoints
├── models.py         # Pydantic data models for validation
├── engine.py         # Core signal processing engines
├── requirements.txt  # Python dependencies
└── README.md         # This file
```

## Core Components

### 1. MachineSimulator (`engine.py`)
Simulates 4 industrial machines (CNC_01 to CNC_04) generating:
- **Temperature** (°C): 0-150 range
- **Vibration** (mm/s): 0-20 range
- **RPM**: 0-5000 range
- **Current** (A): 0-50 range

**Features:**
- Random spike injection (5% probability)
- Gradual drift injection (2% probability)
- Gaussian noise for realistic sensor behavior
- Sliding window storage (100 readings per machine)

### 2. AnomalyDetectionEngine (`engine.py`)
Implements three detection algorithms:

**a) Spike Detection**
- Detects sudden jumps in values
- Uses configurable thresholds per parameter
- Validated through 3-reading buffer

**b) Drift Detection**
- Linear regression on last 10 readings
- Identifies consistent upward trends
- Slope-based detection

**c) Compound Logic**
- Triggers when multiple parameters exceed thresholds simultaneously
- Indicates system-wide issues
- Higher severity for compound anomalies

### 3. RULPredictionEngine (`engine.py`)
Predicts Remaining Useful Life using slope-based trend analysis:

**Formula:**
```
Time to Failure = (Failure Threshold - Current Value) / Rate of Change
```

**Features:**
- Linear regression for trend calculation
- R-squared confidence scoring
- Only predicts when trending toward failure
- Minimum confidence threshold (0.6)

### 4. ValidationBuffer (`engine.py`)
3-reading validation buffer for signal vs noise distinction:
- 1 high reading = Noise (ignore)
- 2 high readings = Suspected (monitor)
- 3 high readings = Anomaly (trigger alert)

### 5. AIAssistant (`engine.py`)
Converts raw error codes into plain English explanations:
- Knowledge base of possible causes
- Recommended actions per anomaly type
- Urgency classification
- Natural language summaries

### 6. VoiceAlertModule (`engine.py`)
Text-to-speech alerts for critical states:
- Uses pyttsx3 for voice synthesis
- Only triggers for CRITICAL severity
- Runs in separate thread to avoid blocking
- Can be toggled on/off

## Installation

### Prerequisites
- Python 3.10 or higher
- pip package manager

### Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
```

3. Activate the virtual environment:

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

### Starting the Server

Run the FastAPI server:
```bash
python main.py
```

Or use uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The server will start at `http://localhost:8000`

### API Endpoints

#### REST API

**Root**
```
GET /
```
Returns API information and available endpoints.

**System Status**
```
GET /status
```
Returns overall system health and all machine states.

**All Machines**
```
GET /machines
```
Returns list of all machines and their current states.

**Machine Detail**
```
GET /machines/{machine_id}
```
Returns detailed information for a specific machine including:
- Current state
- Sliding window data (last 100 readings)
- Anomaly history
- RUL predictions

**Reset Machine**
```
POST /machines/{machine_id}/reset
```
Resets machine drift state (simulates maintenance).

**Toggle Voice Alerts**
```
POST /voice/toggle?enabled=true
```
Enable or disable voice alerts.

**Voice Status**
```
GET /voice/status
```
Check if voice alerts are enabled and available.

#### WebSocket

**Real-time Updates**
```
WS /ws
```
Connect to receive real-time machine updates every second.

**Message Format:**
```json
{
  "type": "machine_update",
  "machine_id": "CNC_01",
  "reading": {
    "machine_id": "CNC_01",
    "timestamp": "2024-01-01T12:00:00",
    "temperature": 45.5,
    "vibration": 2.1,
    "rpm": 3050.0,
    "current": 15.2
  },
  "status": "normal",
  "anomalies": [],
  "rul_predictions": [...]
}
```

### Interactive API Documentation

FastAPI provides automatic interactive documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Signal Processing Pipeline

The system processes data through the following pipeline:

1. **Data Generation**: MachineSimulator generates sensor readings with noise and anomalies
2. **Sliding Window Storage**: Readings stored in deque (max 100 per machine)
3. **Validation Buffer**: Each reading validated against 3-reading buffer
4. **Anomaly Detection**: Three algorithms run in parallel
5. **RUL Prediction**: Trend analysis for failure prediction
6. **AI Explanation**: Plain English explanations generated
7. **Voice Alert**: Critical anomalies trigger voice alerts
8. **WebSocket Broadcast**: Real-time updates sent to clients

## Anomaly Thresholds

### Temperature (°C)
- Warning: 70°C
- Critical: 85°C
- Failure: 100°C

### Vibration (mm/s)
- Warning: 5 mm/s
- Critical: 10 mm/s
- Failure: 15 mm/s

### RPM
- Warning: 4000 RPM
- Critical: 4500 RPM
- Failure: 4800 RPM

### Current (A)
- Warning: 25 A
- Critical: 35 A
- Failure: 40 A

## Example Usage with Python Client

```python
import asyncio
import websockets
import json

async def monitor_machines():
    uri = "ws://localhost:8000/ws"
    async with websockets.connect(uri) as websocket:
        while True:
            data = await websocket.recv()
            message = json.loads(data)
            
            print(f"Machine: {message['machine_id']}")
            print(f"Status: {message['status']}")
            print(f"Temperature: {message['reading']['temperature']:.1f}°C")
            print(f"Vibration: {message['reading']['vibration']:.2f} mm/s")
            
            if message['anomalies']:
                for anomaly in message['anomalies']:
                    print(f"ANOMALY: {anomaly['explanation']['plain_english_summary']}")
            
            print("-" * 50)

asyncio.run(monitor_machines())
```

## Testing the System

### 1. Test REST API
```bash
curl http://localhost:8000/status
curl http://localhost:8000/machines
curl http://localhost:8000/machines/CNC_01
```

### 2. Test WebSocket
Use a WebSocket client like `wscat`:
```bash
wscat -c ws://localhost:8000/ws
```

Or use the Python example above.

### 3. Trigger Anomalies
The system automatically injects random spikes and drifts. To trigger manually:
- Wait for automatic spike injection (5% probability per reading)
- Use the reset endpoint to clear drift state
- Monitor WebSocket for anomaly alerts

## Technical Details

### Data Storage Strategy
- **Offline-first**: All data stored in memory using `collections.deque`
- **Sliding window**: Last 100 readings per machine
- **No database**: Simplified for real-time processing
- **Thread-safe**: Async locks for concurrent access

### Performance Considerations
- Background task runs every 1 second
- WebSocket broadcasting is non-blocking
- Voice alerts run in separate threads
- Validation buffer prevents false positives

### Dependencies
- **FastAPI**: Modern web framework
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation
- **NumPy**: Numerical computations for trend analysis
- **pyttsx3**: Text-to-speech
- **WebSockets**: Real-time communication

## Troubleshooting

### Voice Alerts Not Working
- Check if pyttsx3 is installed correctly
- On Windows, ensure audio drivers are working
- Use `/voice/status` endpoint to check availability
- Voice alerts only trigger for CRITICAL anomalies

### No Data Available
- Wait a few seconds after server start for data generation
- Check `/status` endpoint for active machine count
- Ensure background task is running (check server logs)

### WebSocket Connection Fails
- Ensure server is running on port 8000
- Check firewall settings
- Verify WebSocket client supports ws:// protocol

## Future Enhancements

- [ ] Database integration for historical data
- [ ] Machine learning models for anomaly detection
- [ ] Web dashboard for visualization
- [ ] Email/SMS notifications
- [ ] Support for more machine types
- [ ] Configurable thresholds per machine
- [ ] Historical trend analysis
- [ ] Export data to CSV/JSON

## License

This project is part of the Malendau Hackathon.

## Author

Built with ECE signal processing principles for industrial predictive maintenance.
