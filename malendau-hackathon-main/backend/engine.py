"""
Core Engine for Industrial Predictive Maintenance System
Implements signal processing pipeline with anomaly detection and RUL prediction
"""

import random
import numpy as np
from collections import deque
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import threading
import time

from models import (
    MachineReading, AnomalyAlert, AnomalyType, MachineStatus,
    RULPrediction, MachineState, VoiceAlert
)


class MachineSimulator:
    """
    Simulates 4 industrial machines (CNC_01 to CNC_04)
    Generates Temperature, Vibration, RPM, and Current data
    Injects random spikes and gradual drifts
    """
    
    def __init__(self, window_size: int = 100):
        self.window_size = window_size
        self.machines = ["CNC_01", "CNC_02", "CNC_03", "CNC_04"]
        self.data_windows = {
            machine_id: {
                "temperature": deque(maxlen=window_size),
                "vibration": deque(maxlen=window_size),
                "rpm": deque(maxlen=window_size),
                "current": deque(maxlen=window_size),
                "timestamps": deque(maxlen=window_size)
            }
            for machine_id in self.machines
        }
        
        # Base operating parameters for each machine
        self.base_params = {
            machine_id: {
                "temperature": 45.0 + random.uniform(-5, 5),
                "vibration": 2.0 + random.uniform(-0.5, 0.5),
                "rpm": 3000.0 + random.uniform(-100, 100),
                "current": 15.0 + random.uniform(-2, 2)
            }
            for machine_id in self.machines
        }
        
        # Drift state for gradual degradation simulation
        self.drift_state = {
            machine_id: {
                "temperature_drift": 0.0,
                "vibration_drift": 0.0,
                "rpm_drift": 0.0,
                "current_drift": 0.0
            }
            for machine_id in self.machines
        }
        
        # Spike injection probability (5% chance per reading)
        self.spike_probability = 0.05
        # Drift injection probability (2% chance per reading)
        self.drift_probability = 0.02
    
    def generate_reading(self, machine_id: str) -> MachineReading:
        """Generate a single reading for a specific machine"""
        base = self.base_params[machine_id]
        drift = self.drift_state[machine_id]
        
        # Add random noise (Gaussian distribution)
        temperature = base["temperature"] + drift["temperature_drift"] + random.gauss(0, 1.5)
        vibration = base["vibration"] + drift["vibration_drift"] + random.gauss(0, 0.3)
        rpm = base["rpm"] + drift["rpm_drift"] + random.gauss(0, 50)
        current = base["current"] + drift["current_drift"] + random.gauss(0, 1.0)
        
        # Inject random spikes
        if random.random() < self.spike_probability:
            # Spike one random parameter
            param = random.choice(["temperature", "vibration", "rpm", "current"])
            if param == "temperature":
                temperature += random.uniform(15, 30)
            elif param == "vibration":
                vibration += random.uniform(3, 8)
            elif param == "rpm":
                rpm += random.uniform(500, 1000)
            elif param == "current":
                current += random.uniform(5, 15)
        
        # Inject gradual drift
        if random.random() < self.drift_probability:
            # Increase drift for one parameter
            param = random.choice(["temperature", "vibration", "rpm", "current"])
            if param == "temperature":
                drift["temperature_drift"] += random.uniform(0.1, 0.3)
            elif param == "vibration":
                drift["vibration_drift"] += random.uniform(0.05, 0.15)
            elif param == "rpm":
                drift["rpm_drift"] += random.uniform(10, 30)
            elif param == "current":
                drift["current_drift"] += random.uniform(0.5, 1.5)
        
        # Clamp values to realistic ranges
        temperature = max(0, min(150, temperature))
        vibration = max(0, min(20, vibration))
        rpm = max(0, min(5000, rpm))
        current = max(0, min(50, current))
        
        reading = MachineReading(
            machine_id=machine_id,
            temperature=temperature,
            vibration=vibration,
            rpm=rpm,
            current=current
        )
        
        # Store in sliding window
        self._store_reading(machine_id, reading)
        
        return reading
    
    def _store_reading(self, machine_id: str, reading: MachineReading):
        """Store reading in sliding window"""
        window = self.data_windows[machine_id]
        window["temperature"].append(reading.temperature)
        window["vibration"].append(reading.vibration)
        window["rpm"].append(reading.rpm)
        window["current"].append(reading.current)
        window["timestamps"].append(reading.timestamp)
    
    def get_window_data(self, machine_id: str) -> Dict:
        """Get current sliding window data for a machine"""
        return self.data_windows[machine_id]
    
    def reset_drift(self, machine_id: str):
        """Reset drift state for a machine (simulating maintenance)"""
        self.drift_state[machine_id] = {
            "temperature_drift": 0.0,
            "vibration_drift": 0.0,
            "rpm_drift": 0.0,
            "current_drift": 0.0
        }


class ValidationBuffer:
    """
    3-reading validation buffer to distinguish between Transient Noise and Genuine Failure Signal
    Signal Processing Logic:
    - 1 high reading = Noise (ignore)
    - 2 high readings = Suspected (monitor)
    - 3 high readings = Anomaly (trigger alert)
    """
    
    def __init__(self, buffer_size: int = 3):
        self.buffer_size = buffer_size
        self.buffers = {}  # machine_id -> {parameter -> deque}
    
    def _get_buffer(self, machine_id: str, parameter: str) -> deque:
        """Get or create buffer for a machine and parameter"""
        key = f"{machine_id}_{parameter}"
        if key not in self.buffers:
            self.buffers[key] = deque(maxlen=self.buffer_size)
        return self.buffers[key]
    
    def validate_reading(self, machine_id: str, parameter: str, value: float, threshold: float) -> Tuple[bool, int]:
        """
        Validate a reading against threshold using 3-reading buffer
        Returns: (is_anomaly, consecutive_high_count)
        """
        buffer = self._get_buffer(machine_id, parameter)
        
        is_high = value > threshold
        buffer.append(1 if is_high else 0)
        
        consecutive_high = sum(buffer)
        
        # Signal processing logic:
        # 1 high = Noise (return False)
        # 2 high = Suspected (return False, but monitor)
        # 3 high = Anomaly (return True)
        is_anomaly = consecutive_high >= self.buffer_size
        
        return is_anomaly, consecutive_high
    
    def reset_buffer(self, machine_id: str, parameter: Optional[str] = None):
        """Reset buffer(s) for a machine"""
        if parameter:
            key = f"{machine_id}_{parameter}"
            if key in self.buffers:
                self.buffers[key].clear()
        else:
            # Reset all buffers for this machine
            keys_to_remove = [k for k in self.buffers.keys() if k.startswith(machine_id)]
            for key in keys_to_remove:
                self.buffers[key].clear()


class AnomalyDetectionEngine:
    """
    Implements three anomaly detection algorithms:
    1. Spike Detection: Sudden jumps in values
    2. Drift Detection: Consistent increases over last 10 readings
    3. Compound Logic: Multiple parameters crossing thresholds together
    """
    
    def __init__(self, validation_buffer: ValidationBuffer):
        self.validation_buffer = validation_buffer
        
        # Thresholds for each parameter
        self.thresholds = {
            "temperature": {"warning": 70, "critical": 85},
            "vibration": {"warning": 5, "critical": 10},
            "rpm": {"warning": 4000, "critical": 4500},
            "current": {"warning": 25, "critical": 35}
        }
        
        # Spike detection threshold (sudden change)
        self.spike_threshold = {
            "temperature": 10.0,  # 10°C sudden jump
            "vibration": 2.0,     # 2 mm/s sudden jump
            "rpm": 300.0,         # 300 RPM sudden jump
            "current": 5.0        # 5A sudden jump
        }
    
    def detect_anomalies(self, machine_id: str, reading: MachineReading, window_data: Dict) -> List[AnomalyAlert]:
        """Run all detection algorithms and return alerts"""
        alerts = []
        
        # Run all three detection algorithms
        spike_alerts = self._detect_spikes(machine_id, reading, window_data)
        drift_alerts = self._detect_drifts(machine_id, window_data)
        compound_alerts = self._detect_compound(machine_id, reading, window_data)
        
        alerts.extend(spike_alerts)
        alerts.extend(drift_alerts)
        alerts.extend(compound_alerts)
        
        return alerts
    
    def _detect_spikes(self, machine_id: str, reading: MachineReading, window_data: Dict) -> List[AnomalyAlert]:
        """Detect sudden spikes in values"""
        alerts = []
        parameters = ["temperature", "vibration", "rpm", "current"]
        
        for param in parameters:
            current_value = getattr(reading, param)
            window = window_data[param]
            
            if len(window) < 2:
                continue
            
            # Calculate change from previous reading
            previous_value = window[-2]
            delta = abs(current_value - previous_value)
            
            # Check against spike threshold
            if delta > self.spike_threshold[param]:
                # Use validation buffer to distinguish noise from signal
                is_anomaly, consecutive_count = self.validation_buffer.validate_reading(
                    machine_id, param, current_value, self.thresholds[param]["warning"]
                )
                
                if is_anomaly:
                    severity = MachineStatus.CRITICAL if delta > self.spike_threshold[param] * 1.5 else MachineStatus.WARNING
                    
                    alerts.append(AnomalyAlert(
                        machine_id=machine_id,
                        anomaly_type=AnomalyType.SPIKE,
                        severity=severity,
                        affected_parameters=[param],
                        message=f"Sudden spike detected in {param}: {delta:.2f} unit jump",
                        raw_values={param: current_value, "delta": delta}
                    ))
        
        return alerts
    
    def _detect_drifts(self, machine_id: str, window_data: Dict) -> List[AnomalyAlert]:
        """Detect gradual drifts over last 10 readings"""
        alerts = []
        parameters = ["temperature", "vibration", "rpm", "current"]
        min_readings = 10
        
        for param in parameters:
            window = window_data[param]
            
            if len(window) < min_readings:
                continue
            
            # Calculate trend over last 10 readings
            recent_values = list(window)[-min_readings:]
            
            # Linear regression to find slope
            x = np.arange(len(recent_values))
            y = np.array(recent_values)
            slope = np.polyfit(x, y, 1)[0]  # First coefficient is slope
            
            # Check if slope indicates consistent increase
            if slope > 0.1:  # Positive slope indicating drift
                current_value = recent_values[-1]
                
                # Use validation buffer
                is_anomaly, consecutive_count = self.validation_buffer.validate_reading(
                    machine_id, param, current_value, self.thresholds[param]["warning"]
                )
                
                if is_anomaly:
                    severity = MachineStatus.WARNING
                    if current_value > self.thresholds[param]["critical"]:
                        severity = MachineStatus.CRITICAL
                    
                    alerts.append(AnomalyAlert(
                        machine_id=machine_id,
                        anomaly_type=AnomalyType.DRIFT,
                        severity=severity,
                        affected_parameters=[param],
                        message=f"Gradual drift detected in {param}: increasing at {slope:.3f} units/reading",
                        raw_values={param: current_value, "slope": slope}
                    ))
        
        return alerts
    
    def _detect_compound(self, machine_id: str, reading: MachineReading, window_data: Dict) -> List[AnomalyAlert]:
        """Detect compound anomalies when multiple parameters cross thresholds together"""
        alerts = []
        
        # Check which parameters are above warning threshold
        high_params = []
        parameters = ["temperature", "vibration", "rpm", "current"]
        
        for param in parameters:
            current_value = getattr(reading, param)
            if current_value > self.thresholds[param]["warning"]:
                # Validate with buffer
                is_anomaly, consecutive_count = self.validation_buffer.validate_reading(
                    machine_id, param, current_value, self.thresholds[param]["warning"]
                )
                if is_anomaly:
                    high_params.append(param)
        
        # Compound anomaly: at least 2 parameters above threshold
        if len(high_params) >= 2:
            # Check if any are critical
            has_critical = any(
                getattr(reading, param) > self.thresholds[param]["critical"]
                for param in high_params
            )
            
            severity = MachineStatus.CRITICAL if has_critical else MachineStatus.WARNING
            
            alerts.append(AnomalyAlert(
                machine_id=machine_id,
                anomaly_type=AnomalyType.COMPOUND,
                severity=severity,
                affected_parameters=high_params,
                message=f"Compound anomaly: Multiple parameters elevated - {', '.join(high_params)}",
                raw_values={param: getattr(reading, param) for param in high_params}
            ))
        
        return alerts


class RULPredictionEngine:
    """
    Remaining Useful Life (RUL) Prediction Engine
    Uses slope-based trend analysis to predict time to failure
    Formula: Time to Failure = (Limit - Current Value) / (Delta Value / Delta Time)
    """
    
    def __init__(self):
        # Failure thresholds for each parameter
        self.failure_thresholds = {
            "temperature": 100.0,  # °C
            "vibration": 15.0,     # mm/s
            "rpm": 4800.0,         # RPM
            "current": 40.0        # Amperes
        }
        
        # Minimum trend confidence threshold
        self.min_confidence = 0.6
    
    def predict_rul(self, machine_id: str, window_data: Dict, sampling_interval: float = 1.0) -> List[RULPrediction]:
        """
        Predict RUL for all parameters based on trend analysis
        sampling_interval: time between readings in seconds
        """
        predictions = []
        parameters = ["temperature", "vibration", "rpm", "current"]
        min_readings = 20  # Need at least 20 readings for reliable trend
        
        for param in parameters:
            window = window_data[param]
            
            if len(window) < min_readings:
                # Not enough data for prediction
                predictions.append(RULPrediction(
                    machine_id=machine_id,
                    parameter=param,
                    current_value=window[-1] if window else 0,
                    failure_threshold=self.failure_thresholds[param],
                    rate_of_change=0.0,
                    predicted_rul_seconds=None,
                    confidence=0.0
                ))
                continue
            
            # Calculate trend using linear regression
            recent_values = list(window)[-min_readings:]
            x = np.arange(len(recent_values)) * sampling_interval  # Time in seconds
            y = np.array(recent_values)
            
            # Fit linear regression: y = mx + b
            slope, intercept = np.polyfit(x, y, 1)
            
            # Calculate R-squared for confidence
            y_pred = slope * x + intercept
            ss_res = np.sum((y - y_pred) ** 2)
            ss_tot = np.sum((y - np.mean(y)) ** 2)
            r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
            
            current_value = recent_values[-1]
            failure_threshold = self.failure_thresholds[param]
            
            # Only predict if trending towards failure
            if slope > 0 and current_value < failure_threshold:
                # RUL calculation: (Threshold - Current) / Rate
                rul_seconds = (failure_threshold - current_value) / slope
                
                # Apply confidence threshold
                confidence = max(0, min(1, r_squared))
                
                if confidence >= self.min_confidence:
                    predictions.append(RULPrediction(
                        machine_id=machine_id,
                        parameter=param,
                        current_value=current_value,
                        failure_threshold=failure_threshold,
                        rate_of_change=slope,  # units per second
                        predicted_rul_seconds=rul_seconds,
                        confidence=confidence
                    ))
                    continue
            
            # No significant trend or not approaching failure
            predictions.append(RULPrediction(
                machine_id=machine_id,
                parameter=param,
                current_value=current_value,
                failure_threshold=failure_threshold,
                rate_of_change=slope,
                predicted_rul_seconds=None,
                confidence=r_squared
            ))
        
        return predictions


class AIAssistant:
    """
    AI Assistant module that converts raw error codes and anomaly data
    into plain English explanations for operators
    """
    
    def __init__(self):
        # Knowledge base for anomaly explanations
        self.explanation_db = {
            "temperature_spike": {
                "possible_causes": [
                    "Cooling system malfunction",
                    "Blocked ventilation",
                    "Overload condition",
                    "Environmental temperature spike"
                ],
                "recommended_actions": [
                    "Check cooling system operation",
                    "Inspect ventilation filters",
                    "Reduce load if possible",
                    "Monitor ambient temperature"
                ],
                "urgency": "high"
            },
            "temperature_drift": {
                "possible_causes": [
                    "Gradual cooling system degradation",
                    "Thermal paste deterioration",
                    "Heat sink fouling",
                    "Increasing workload"
                ],
                "recommended_actions": [
                    "Schedule maintenance for cooling system",
                    "Inspect and clean heat sinks",
                    "Review workload patterns",
                    "Plan preventive maintenance"
                ],
                "urgency": "medium"
            },
            "vibration_spike": {
                "possible_causes": [
                    "Bearing failure",
                    "Loose components",
                    "Imbalance",
                    "Foreign object in mechanism"
                ],
                "recommended_actions": [
                    "Immediate machine shutdown recommended",
                    "Inspect bearings",
                    "Check for loose bolts/connections",
                    "Perform vibration analysis"
                ],
                "urgency": "critical"
            },
            "vibration_drift": {
                "possible_causes": [
                    "Bearing wear",
                    "Misalignment",
                    "Gradual imbalance",
                    "Foundation settling"
                ],
                "recommended_actions": [
                    "Schedule bearing inspection",
                    "Check alignment",
                    "Perform balance check",
                    "Monitor foundation integrity"
                ],
                "urgency": "medium"
            },
            "rpm_spike": {
                "possible_causes": [
                    "Controller malfunction",
                    "Speed sensor error",
                    "Load sudden drop",
                    "Drive system fault"
                ],
                "recommended_actions": [
                    "Check speed controller",
                    "Verify sensor calibration",
                    "Review load conditions",
                    "Inspect drive system"
                ],
                "urgency": "high"
            },
            "current_spike": {
                "possible_causes": [
                    "Motor overload",
                    "Short circuit",
                    "Binding in mechanism",
                    "Power supply issue"
                ],
                "recommended_actions": [
                    "Immediate inspection required",
                    "Check for mechanical binding",
                    "Inspect motor windings",
                    "Verify power supply stability"
                ],
                "urgency": "critical"
            },
            "compound": {
                "possible_causes": [
                    "System-wide failure imminent",
                    "Multiple component degradation",
                    "Cascading failure in progress",
                    "Control system malfunction"
                ],
                "recommended_actions": [
                    "IMMEDIATE MACHINE SHUTDOWN",
                    "Full system inspection required",
                    "Check all interrelated systems",
                    "Contact maintenance team urgently"
                ],
                "urgency": "critical"
            }
        }
    
    def generate_explanation(self, alert: AnomalyAlert) -> dict:
        """
        Convert an anomaly alert into a plain English explanation
        Returns a dict with explanation, causes, and recommendations
        """
        anomaly_key = f"{alert.affected_parameters[0]}_{alert.anomaly_type.value}"
        
        if alert.anomaly_type == AnomalyType.COMPOUND:
            anomaly_key = "compound"
        
        # Get explanation from knowledge base
        knowledge = self.explanation_db.get(anomaly_key, self._get_generic_explanation(alert))
        
        # Generate plain English summary
        summary = self._generate_summary(alert, knowledge)
        
        return {
            "alert_id": f"{alert.machine_id}_{alert.timestamp.timestamp()}",
            "machine_id": alert.machine_id,
            "severity": alert.severity.value,
            "plain_english_summary": summary,
            "possible_causes": knowledge["possible_causes"],
            "recommended_actions": knowledge["recommended_actions"],
            "urgency": knowledge["urgency"],
            "affected_parameters": alert.affected_parameters,
            "raw_message": alert.message
        }
    
    def _generate_summary(self, alert: AnomalyAlert, knowledge: dict) -> str:
        """Generate a natural language summary"""
        param = " and ".join(alert.affected_parameters)
        
        if alert.anomaly_type == AnomalyType.SPIKE:
            summary = f"Sudden spike detected in {param} on {alert.machine_id}. "
        elif alert.anomaly_type == AnomalyType.DRIFT:
            summary = f"Gradual drift detected in {param} on {alert.machine_id}. "
        elif alert.anomaly_type == AnomalyType.COMPOUND:
            summary = f"Multiple parameters ({param}) are elevated on {alert.machine_id}, indicating a compound anomaly. "
        else:
            summary = f"Anomaly detected in {param} on {alert.machine_id}. "
        
        # Add urgency context
        if knowledge["urgency"] == "critical":
            summary += "This requires immediate attention. "
        elif knowledge["urgency"] == "high":
            summary += "This should be addressed soon. "
        else:
            summary += "Monitor this situation. "
        
        # Add primary cause
        if knowledge["possible_causes"]:
            summary += f"Most likely cause: {knowledge['possible_causes'][0].lower()}."
        
        return summary
    
    def _get_generic_explanation(self, alert: AnomalyAlert) -> dict:
        """Fallback explanation for unknown anomaly types"""
        return {
            "possible_causes": ["Unknown cause", "Sensor error", "System anomaly"],
            "recommended_actions": ["Investigate further", "Check sensors", "Monitor closely"],
            "urgency": "medium"
        }


class VoiceAlertModule:
    """
    Voice Alert Module using pyttsx3 for text-to-speech alerts
    Generates voice alerts for critical states
    """
    
    def __init__(self):
        self.engine = None
        self.enabled = True
        self._initialize_engine()
    
    def _initialize_engine(self):
        """Initialize the text-to-speech engine"""
        try:
            import pyttsx3
            self.engine = pyttsx3.init()
            # Set properties
            self.engine.setProperty('rate', 150)  # Speed
            self.engine.setProperty('volume', 1.0)  # Max volume
        except Exception as e:
            print(f"Warning: Could not initialize voice engine: {e}")
            self.enabled = False
    
    def speak_alert(self, alert: AnomalyAlert, explanation: dict):
        """
        Generate voice alert for critical anomalies
        Only speaks for CRITICAL severity alerts
        """
        if not self.enabled or alert.severity != MachineStatus.CRITICAL:
            return
        
        if self.engine is None:
            return
        
        # Generate voice message
        message = self._generate_voice_message(alert, explanation)
        
        try:
            # Run in a separate thread to avoid blocking
            def speak():
                try:
                    self.engine.say(message)
                    self.engine.runAndWait()
                except:
                    pass
            
            thread = threading.Thread(target=speak)
            thread.daemon = True
            thread.start()
        except Exception as e:
            print(f"Error generating voice alert: {e}")
    
    def _generate_voice_message(self, alert: AnomalyAlert, explanation: dict) -> str:
        """Generate a concise voice message"""
        machine = alert.machine_id.replace("_", " ")
        params = " and ".join(alert.affected_parameters)
        
        message = f"Alert. Machine {machine}. Critical anomaly detected in {params}. "
        message += explanation["plain_english_summary"]
        
        # Keep it short for voice
        if len(message) > 200:
            message = message[:200] + "."
        
        return message
    
    def speak_message(self, message: str):
        """Speak a custom message"""
        if not self.enabled or self.engine is None:
            return
        
        def speak():
            try:
                self.engine.say(message)
                self.engine.runAndWait()
            except:
                pass
        
        thread = threading.Thread(target=speak)
        thread.daemon = True
        thread.start()
    
    def set_enabled(self, enabled: bool):
        """Enable or disable voice alerts"""
        self.enabled = enabled
