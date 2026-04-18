"""
Data Models for Industrial Predictive Maintenance System
Uses Pydantic for data validation and serialization
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class MachineStatus(str, Enum):
    """Machine operational status"""
    NORMAL = "normal"
    WARNING = "warning"
    CRITICAL = "critical"
    FAILURE = "failure"


class AnomalyType(str, Enum):
    """Types of anomalies that can be detected"""
    SPIKE = "spike"
    DRIFT = "drift"
    COMPOUND = "compound"
    NONE = "none"


class MachineReading(BaseModel):
    """Single reading from a machine sensor"""
    machine_id: str = Field(..., description="Machine identifier (e.g., CNC_01)")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Reading timestamp")
    temperature: float = Field(..., ge=0, le=150, description="Temperature in Celsius")
    vibration: float = Field(..., ge=0, le=20, description="Vibration in mm/s")
    rpm: float = Field(..., ge=0, le=5000, description="Rotations per minute")
    current: float = Field(..., ge=0, le=50, description="Current in Amperes")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class AnomalyAlert(BaseModel):
    """Alert generated when anomaly is detected"""
    machine_id: str
    anomaly_type: AnomalyType
    severity: MachineStatus
    affected_parameters: List[str]
    message: str
    raw_values: dict
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class RULPrediction(BaseModel):
    """Remaining Useful Life prediction"""
    machine_id: str
    parameter: str
    current_value: float
    failure_threshold: float
    rate_of_change: float  # units per second
    predicted_rul_seconds: Optional[float] = None  # None if no trend detected
    confidence: float = Field(..., ge=0, le=1, description="Confidence score 0-1")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class MachineState(BaseModel):
    """Complete state of a machine including readings, anomalies, and RUL"""
    machine_id: str
    latest_reading: MachineReading
    status: MachineStatus
    anomaly_alerts: List[AnomalyAlert] = []
    rul_predictions: List[RULPrediction] = []
    window_size: int = Field(default=100, description="Size of sliding window")
    current_window_size: int = Field(default=0, description="Current readings in window")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class SystemStatus(BaseModel):
    """Overall system status for all machines"""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    total_machines: int
    active_machines: int
    machines: dict  # machine_id -> MachineState
    system_health: str  # "healthy", "degraded", "critical"
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class VoiceAlert(BaseModel):
    """Voice alert configuration and content"""
    machine_id: str
    severity: MachineStatus
    message: str
    enabled: bool = True
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
