import { useState, useEffect, useCallback } from 'react';
import { playAlertSound, speakAlert } from '../utils/audioAlert';

const MACHINE_BASELINES = {
  CNC_01: {
    temperature_C: { base: 80, min: 75, max: 85, threshold: 100 },
    vibration_mm_s: { base: 2.0, min: 1.5, max: 2.5, threshold: 5.0 },
    rpm: { base: 1500, min: 1400, max: 1600, threshold: 2000 },
    current_A: { base: 13.5, min: 12, max: 15, threshold: 20 },
    label: 'CNC Lathe Unit 1'
  },
  CNC_02: {
    temperature_C: { base: 75, min: 70, max: 80, threshold: 95 },
    vibration_mm_s: { base: 1.5, min: 1.0, max: 2.0, threshold: 4.5 },
    rpm: { base: 1500, min: 1450, max: 1550, threshold: 1900 },
    current_A: { base: 12.5, min: 11, max: 14, threshold: 18 },
    label: 'CNC Lathe Unit 2'
  },
  HVAC_01: {
    temperature_C: { base: 50, min: 45, max: 55, threshold: 80 },
    vibration_mm_s: { base: 1.0, min: 0.5, max: 1.5, threshold: 3.0 },
    rpm: { base: 900, min: 800, max: 1000, threshold: 1200 },
    current_A: { base: 9.5, min: 8, max: 11, threshold: 15 },
    label: 'HVAC Cooling System'
  },
  PUMP_01: {
    temperature_C: { base: 65, min: 60, max: 70, threshold: 90 },
    vibration_mm_s: { base: 2.8, min: 2.0, max: 3.5, threshold: 6.0 },
    rpm: { base: 3000, min: 2800, max: 3200, threshold: 3800 },
    current_A: { base: 16.5, min: 15, max: 18, threshold: 25 },
    label: 'Hydraulic Pump Unit'
  }
};

const MACHINE_IDS = Object.keys(MACHINE_BASELINES);
const HISTORY_SIZE = 600; // 10 minutes at 1 reading per second

// Initialize live state with slight randomization
const initializeLiveState = () => {
  const state = {};
  MACHINE_IDS.forEach(id => {
    const baseline = MACHINE_BASELINES[id];
    state[id] = {
      temperature_C: baseline.temperature_C.base + (Math.random() - 0.5) * 5,
      vibration_mm_s: baseline.vibration_mm_s.base + (Math.random() - 0.5) * 0.5,
      rpm: baseline.rpm.base + (Math.random() - 0.5) * 50,
      current_A: baseline.current_A.base + (Math.random() - 0.5) * 1.5,
      drift: {
        temperature: 0,
        vibration: 0,
        rpm: 0,
        current: 0
      },
      tick: 0
    };
  });
  return state;
};

const calculateStatus = (reading, baseline) => {
  const thresholds = baseline;
  const warningThreshold = 0.85;
  const faultThreshold = 0.95;
  
  for (const [sensor, value] of Object.entries(reading)) {
    if (sensor === 'machine_id' || sensor === 'timestamp') continue;
    
    const sensorBaseline = thresholds[sensor]?.threshold;
    if (sensorBaseline && value > sensorBaseline * faultThreshold) {
      return 'fault';
    }
    if (sensorBaseline && value > sensorBaseline * warningThreshold) {
      return 'warning';
    }
  }
  
  return 'running';
};

const calculateRiskScore = (reading, baseline) => {
  let totalDeviation = 0;
  let sensorCount = 0;
  
  for (const [sensor, value] of Object.entries(reading)) {
    if (sensor === 'machine_id' || sensor === 'timestamp') continue;
    
    const sensorBaseline = baseline[sensor];
    if (sensorBaseline) {
      const deviation = Math.abs(value - sensorBaseline.base) / (sensorBaseline.max - sensorBaseline.min);
      totalDeviation += deviation;
      sensorCount++;
    }
  }
  
  const avgDeviation = sensorCount > 0 ? totalDeviation / sensorCount : 0;
  return Math.min(100, Math.round(avgDeviation * 100));
};

export const useSensorSimulator = () => {
  const [machines, setMachines] = useState(MACHINE_BASELINES);
  const [latestReadings, setLatestReadings] = useState({});
  const [history, setHistory] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [liveState, setLiveState] = useState(initializeLiveState);
  const [anomalyState, setAnomalyState] = useState({});
  const [previousStatus, setPreviousStatus] = useState({});

  // Initialize previousStatus to 'running' for all machines
  useEffect(() => {
    const initialStatus = {};
    MACHINE_IDS.forEach(id => {
      initialStatus[id] = 'running';
    });
    setPreviousStatus(initialStatus);
  }, []);

  // Initialize history buffers
  useEffect(() => {
    const initialHistory = {};
    MACHINE_IDS.forEach(id => {
      initialHistory[id] = {
        temperature_C: [],
        vibration_mm_s: [],
        rpm: [],
        current_A: [],
        timestamps: []
      };
    });
    setHistory(initialHistory);
  }, []);

  const generateReading = useCallback((machineId) => {
    const baseline = machines[machineId];
    const state = liveState[machineId];
    const anomaly = anomalyState[machineId] || { active: false, sensor: null, remaining: 0 };
    
    state.tick++;
    
    // Apply slow mean-reversion with noise
    let temp = state.temperature_C + (baseline.temperature_C.base - state.temperature_C) * 0.02 + (Math.random() - 0.5) * 0.8;
    let vib = state.vibration_mm_s + (baseline.vibration_mm_s.base - state.vibration_mm_s) * 0.02 + (Math.random() - 0.5) * 0.1;
    let rpm = state.rpm + (baseline.rpm.base - state.rpm) * 0.02 + (Math.random() - 0.5) * 16;
    let current = state.current_A + (baseline.current_A.base - state.current_A) * 0.02 + (Math.random() - 0.5) * 0.3;
    
    // Apply active anomaly
    if (anomaly.active && anomaly.remaining > 0) {
      switch (anomaly.sensor) {
        case 'temperature_C':
          temp += 15 + Math.random() * 10;
          break;
        case 'vibration_mm_s':
          vib += 3 + Math.random() * 2;
          break;
        case 'rpm':
          rpm += 300 + Math.random() * 200;
          break;
        case 'current_A':
          current += 5 + Math.random() * 3;
          break;
      }
      anomaly.remaining--;
      
      if (anomaly.remaining <= 0) {
        setAnomalyState(prev => ({
          ...prev,
          [machineId]: { active: false, sensor: null, remaining: 0 }
        }));
      } else {
        setAnomalyState(prev => ({
          ...prev,
          [machineId]: anomaly
        }));
      }
    }
    
    // Apply gradual drift
    temp += state.drift.temperature;
    vib += state.drift.vibration;
    rpm += state.drift.rpm;
    current += state.drift.current;
    
    // Clamp values to realistic ranges
    temp = Math.max(20, Math.min(130, temp));
    vib = Math.max(0.1, Math.min(12, vib));
    rpm = Math.max(100, Math.min(4000, rpm));
    current = Math.max(1, Math.min(30, current));
    
    // Update state
    const newState = {
      ...state,
      temperature_C: temp,
      vibration_mm_s: vib,
      rpm: rpm,
      current_A: current
    };
    
    setLiveState(prev => ({
      ...prev,
      [machineId]: newState
    }));
    
    const reading = {
      machine_id: machineId,
      timestamp: new Date().toISOString(),
      temperature_C: parseFloat(temp.toFixed(2)),
      vibration_mm_s: parseFloat(vib.toFixed(2)),
      rpm: Math.round(rpm),
      current_A: parseFloat(current.toFixed(2))
    };
    
    return reading;
  }, [machines, liveState, anomalyState]);

  const injectAnomaly = useCallback((machineId) => {
    const sensors = ['temperature_C', 'vibration_mm_s', 'rpm', 'current_A'];
    const sensor = sensors[Math.floor(Math.random() * sensors.length)];
    const duration = 30 + Math.floor(Math.random() * 30); // 30-60 seconds
    
    setAnomalyState(prev => ({
      ...prev,
      [machineId]: { active: true, sensor, remaining: duration }
    }));
  }, []);

  // Main simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      MACHINE_IDS.forEach(machineId => {
        const reading = generateReading(machineId);
        const baseline = machines[machineId];
        
        // Calculate status and risk
        const status = calculateStatus(reading, baseline);
        const riskScore = calculateRiskScore(reading, baseline);
        
        const enrichedReading = { ...reading, status, riskScore };
        
        // Check for status changes and trigger alerts
        const prevStatus = previousStatus[machineId];
        if (prevStatus !== status) {
          if (status === 'fault') {
            playAlertSound('fault');
            speakAlert(`${baseline.label} is now in fault state. Immediate attention required.`);
          }
          setPreviousStatus(prev => ({ ...prev, [machineId]: status }));
        }
        
        // Check for high risk score
        if (riskScore >= 70 && riskScore < 85) {
          playAlertSound('risk');
        } else if (riskScore >= 85 && prevStatus !== 'fault') {
          playAlertSound('fault');
        }
        
        // Update latest readings
        setLatestReadings(prev => ({
          ...prev,
          [machineId]: enrichedReading
        }));
        
        // Update history buffers
        setHistory(prev => {
          const newHistory = { ...prev };
          Object.keys(reading).forEach(key => {
            if (key !== 'machine_id') {
              newHistory[machineId][key] = [
                ...(newHistory[machineId][key] || []),
                reading[key]
              ].slice(-HISTORY_SIZE);
            }
          });
          newHistory[machineId].timestamps = [
            ...(newHistory[machineId].timestamps || []),
            reading.timestamp
          ].slice(-HISTORY_SIZE);
          return newHistory;
        });
        
        // Generate alert if status changed to warning or fault (only on change, not every tick)
        const shouldGenerateAlert = status !== 'running' && prevStatus !== status && prevStatus !== undefined;
        
        if (shouldGenerateAlert) {
          const alert = {
            id: `ALT-${Date.now()}-${machineId}`,
            machine_id: machineId,
            machine_label: baseline.label,
            sensor: Object.keys(reading).find(k => {
              if (k === 'machine_id' || k === 'timestamp' || k === 'status' || k === 'riskScore') return false;
              const threshold = baseline[k]?.threshold;
              return threshold && reading[k] > threshold * 0.85;
            }) || 'UNKNOWN',
            value: reading[Object.keys(reading).find(k => {
              if (k === 'machine_id' || k === 'timestamp' || k === 'status' || k === 'riskScore') return false;
              const threshold = baseline[k]?.threshold;
              return threshold && reading[k] > threshold * 0.85;
            })] || 0,
            severity: status,
            timestamp: reading.timestamp,
            read: false
          };
          
          setAlerts(prev => [alert, ...prev].slice(0, 50));
        }
      });
      
      // Randomly inject anomaly (every 5-10 seconds for testing)
      if (Math.random() < 0.1) {
        const randomMachine = MACHINE_IDS[Math.floor(Math.random() * MACHINE_IDS.length)];
        injectAnomaly(randomMachine);
      }
      
    }, 1000);
    
    return () => clearInterval(interval);
  }, [generateReading, machines, injectAnomaly]);

  const dismissAlert = useCallback((alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
  }, []);

  const markAllAlertsRead = useCallback(() => {
    setAlerts(prev => prev.map(alert => ({ ...alert, read: true })));
  }, []);

  return {
    machines,
    latestReadings,
    history,
    alerts,
    dismissAlert,
    markAllAlertsRead,
    machineIds: MACHINE_IDS
  };
};
