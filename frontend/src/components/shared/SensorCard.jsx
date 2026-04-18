import { Thermometer, Activity, RotateCw, Zap } from 'lucide-react';

const SensorCard = ({ label, value, unit, icon: Icon, status = 'normal' }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'warning': return 'text-warning';
      case 'fault': return 'text-danger';
      default: return 'text-primary';
    }
  };

  const getBgColor = () => {
    switch (status) {
      case 'warning': return 'bg-yellow-50 border-yellow-300';
      case 'fault': return 'bg-red-50 border-red-300';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`${getBgColor()} border rounded-lg p-3 transition-all duration-200`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} className={getStatusColor()} />
        <span className="text-xs text-textMuted">{label}</span>
      </div>
      <div className={`text-lg font-mono font-semibold ${getStatusColor()}`}>
        {typeof value === 'number' ? value.toFixed(1) : value}
        <span className="text-sm text-textMuted ml-1">{unit}</span>
      </div>
    </div>
  );
};

export const TemperatureCard = (props) => <SensorCard {...props} label="Temperature" icon={Thermometer} unit="°C" />;
export const VibrationCard = (props) => <SensorCard {...props} label="Vibration" icon={Activity} unit="mm/s" />;
export const RPMCard = (props) => <SensorCard {...props} label="RPM" icon={RotateCw} unit="" />;
export const CurrentCard = (props) => <SensorCard {...props} label="Current" icon={Zap} unit="A" />;
