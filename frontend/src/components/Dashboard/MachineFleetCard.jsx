import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import RiskGauge from '../shared/RiskGauge';
import SparklineChart from '../shared/SparklineChart';
import { TemperatureCard, VibrationCard, RPMCard, CurrentCard } from '../shared/SensorCard';
import MaintenanceAssignment from './MaintenanceAssignment';

const MachineFleetCard = ({ machineId, machineLabel, reading, history, costAnalysis }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'warning': return 'bg-warning';
      case 'fault': return 'bg-danger';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'running': return 'RUNNING';
      case 'warning': return 'WARNING';
      case 'fault': return 'FAULT';
      default: return 'UNKNOWN';
    }
  };

  const getGlowClass = (status) => {
    switch (status) {
      case 'warning': return 'glow-warning';
      case 'fault': return 'glow-danger';
      default: return '';
    }
  };

  const getHealthColor = (health) => {
    if (health >= 80) return 'text-green-600';
    if (health >= 50) return 'text-warning';
    return 'text-danger';
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'Fix Immediately': return 'text-danger bg-red-50 border-red-200';
      case 'Schedule Soon': return 'text-warning bg-yellow-50 border-yellow-200';
      case 'Monitor': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSensorStatus = (value, baseline) => {
    const threshold = baseline?.threshold;
    if (!threshold) return 'normal';
    if (value > threshold * 0.95) return 'fault';
    if (value > threshold * 0.85) return 'warning';
    return 'normal';
  };

  const baseline = reading?.machine_id ? {
    temperature_C: { threshold: 100 },
    vibration_mm_s: { threshold: 5.0 },
    rpm: { threshold: 2000 },
    current_A: { threshold: 20 }
  } : {};

  // Smooth health calculation - use a threshold to prevent small changes from updating
  const currentHealth = Math.max(0, Math.min(100, 100 - (reading?.riskScore || 0)));
  const [smoothedHealth, setSmoothedHealth] = React.useState(currentHealth);

  React.useEffect(() => {
    // Only update if the change is significant (more than 5%)
    if (Math.abs(currentHealth - smoothedHealth) > 5) {
      setSmoothedHealth(currentHealth);
    }
  }, [currentHealth, smoothedHealth]);

  const healthPercentage = smoothedHealth.toFixed(0);

  const sparklineData = history?.temperature_C?.slice(-30).map((temp, i) => ({
    value: temp,
    time: i
  })) || [];

  const vibrationData = history?.vibration_mm_s?.slice(-30).map((vib, i) => ({
    value: vib,
    time: i
  })) || [];

  const currentData = history?.current_A?.slice(-30).map((curr, i) => ({
    value: curr,
    time: i
  })) || [];

  return (
    <div className={`
      glass-card rounded-xl p-6 transition-all duration-300
      ${getGlowClass(reading?.status)}
      hover:scale-[1.02] hover:shadow-md
    `}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-textPrimary text-lg">{machineLabel}</h3>
          <p className="text-sm text-textMuted">{machineId}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(reading?.status)} animate-pulse`} />
          <span className={`text-sm font-semibold ${
            reading?.status === 'running' ? 'text-green-600' :
            reading?.status === 'warning' ? 'text-warning' :
            'text-danger'
          }`}>
            {getStatusText(reading?.status)}
          </span>
        </div>
      </div>

      {/* Health Percentage */}
      <div className="flex items-center justify-between mb-4 px-2">
        <span className="text-sm text-textMuted">Health</span>
        <span className={`text-2xl font-bold ${getHealthColor(healthPercentage)}`}>
          {healthPercentage}%
        </span>
      </div>

      {/* Risk Gauge */}
      <div className="flex items-center justify-center my-6">
        <RiskGauge score={reading?.riskScore || 0} size={100} />
      </div>

      {/* Sensor Readings Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <TemperatureCard 
          value={reading?.temperature_C} 
          status={getSensorStatus(reading?.temperature_C, baseline.temperature_C)} 
        />
        <VibrationCard 
          value={reading?.vibration_mm_s} 
          status={getSensorStatus(reading?.vibration_mm_s, baseline.vibration_mm_s)} 
        />
        <RPMCard 
          value={reading?.rpm} 
          status={getSensorStatus(reading?.rpm, baseline.rpm)} 
        />
        <CurrentCard 
          value={reading?.current_A} 
          status={getSensorStatus(reading?.current_A, baseline.current_A)} 
        />
      </div>

      {/* Temperature Sparkline */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-textMuted">Temperature Trend (30s)</span>
          {sparklineData.length > 0 && 
            sparklineData[sparklineData.length - 1].value > 
            sparklineData[0].value + 5 && (
              <span className="text-xs text-warning">Rising</span>
            )
          }
        </div>
        <SparklineChart data={sparklineData} height={50} color="#DC3545" />
      </div>

      {/* Vibration Sparkline */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-textMuted">Vibration Trend (30s)</span>
          {vibrationData.length > 0 && 
            vibrationData[vibrationData.length - 1].value > 
            vibrationData[0].value + 0.5 && (
              <span className="text-xs text-warning">Rising</span>
            )
          }
        </div>
        <SparklineChart data={vibrationData} height={50} color="#FFB300" />
      </div>

      {/* Current Sparkline */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-textMuted">Current Trend (30s)</span>
          {currentData.length > 0 && 
            currentData[currentData.length - 1].value > 
            currentData[0].value + 2 && (
              <span className="text-xs text-warning">Rising</span>
            )
          }
        </div>
        <SparklineChart data={currentData} height={50} color="#0066CC" />
      </div>

      {/* Cost Analysis Section */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-textPrimary">💰 Cost Analysis</span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-textMuted">Estimated Loss:</span>
            <span className="font-medium text-textPrimary">₹{costAnalysis?.loss?.toLocaleString() || 0}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-textMuted">Maintenance Cost:</span>
            <span className="font-medium text-textPrimary">₹{costAnalysis?.maintenanceCost?.toLocaleString() || 0}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-textMuted">Savings:</span>
            <span className={`font-medium ${costAnalysis?.savings > 0 ? 'text-green-600' : 'text-danger'}`}>
              ₹{costAnalysis?.savings?.toLocaleString() || 0}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className={`text-xs font-semibold px-2 py-1 rounded border ${getRecommendationColor(costAnalysis?.recommendation)}`}>
              {costAnalysis?.recommendation || 'Monitor'}
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Assignment Section */}
      <MaintenanceAssignment 
        machineId={machineId}
        machineLabel={machineLabel}
        costAnalysis={costAnalysis}
      />

      {/* View Details Button */}
      <Link
        to={`/machine/${machineId}`}
        className="flex items-center justify-center gap-2 w-full py-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors font-medium"
      >
        View Details
        <ArrowRight size={16} />
      </Link>
    </div>
  );
};

export default MachineFleetCard;
