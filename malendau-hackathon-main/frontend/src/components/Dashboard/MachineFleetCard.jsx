import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import RiskGauge from '../shared/RiskGauge';
import SparklineChart from '../shared/SparklineChart';
import { TemperatureCard, VibrationCard, RPMCard, CurrentCard } from '../shared/SensorCard';

const MachineFleetCard = ({ machineId, machineLabel, reading, history }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'warning': return 'bg-warning';
      case 'fault': return 'bg-danger';
      default: return 'bg-gray-500';
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

  const sparklineData = history?.temperature_C?.slice(-30).map((temp, i) => ({
    value: temp,
    time: i
  })) || [];

  return (
    <div className={`
      glass-card rounded-xl p-6 transition-all duration-300
      ${getGlowClass(reading?.status)}
      hover:scale-[1.02] hover:shadow-xl
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
            reading?.status === 'running' ? 'text-green-400' :
            reading?.status === 'warning' ? 'text-warning' :
            'text-danger'
          }`}>
            {getStatusText(reading?.status)}
          </span>
        </div>
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
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-textMuted">Temperature Trend (30s)</span>
          {sparklineData.length > 0 && 
            sparklineData[sparklineData.length - 1].value > 
            sparklineData[0].value + 5 && (
              <span className="text-xs text-warning">⚠️ Rising</span>
            )
          }
        </div>
        <SparklineChart data={sparklineData} height={60} />
      </div>

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
