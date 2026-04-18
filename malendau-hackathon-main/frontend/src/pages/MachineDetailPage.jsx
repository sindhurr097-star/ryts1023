import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Brain, Clock } from 'lucide-react';
import { useMachineContext } from '../App';
import SensorChart from '../components/MachineDetail/SensorChart';
import RiskGauge from '../components/shared/RiskGauge';

const MachineDetailPage = () => {
  const { machineId } = useParams();
  const { latestReadings, history, machines } = useMachineContext();
  const [activeTab, setActiveTab] = useState('live');

  const machineLabel = machines[machineId]?.label || 'Unknown Machine';
  const reading = latestReadings[machineId];
  const machineHistory = history[machineId];
  const baseline = machines[machineId];

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-green-400';
      case 'warning': return 'text-warning';
      case 'fault': return 'text-danger';
      default: return 'text-gray-400';
    }
  };

  if (!reading) {
    return (
      <div className="p-6">
        <div className="text-center text-textMuted">Loading machine data...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-surfaceBorder rounded-lg transition-colors">
              <ArrowLeft size={24} className="text-textPrimary" />
            </Link>
            <div>
              <h1 className="font-display font-bold text-textPrimary text-2xl">
                {machineLabel}
              </h1>
              <p className="text-textMuted">{machineId}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                reading.status === 'running' ? 'bg-green-500' :
                reading.status === 'warning' ? 'bg-warning' :
                'bg-danger'
              } animate-pulse`} />
              <span className={`font-semibold ${getStatusColor(reading.status)}`}>
                {reading.status.toUpperCase()}
              </span>
            </div>
            <RiskGauge score={reading.riskScore} size={80} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'live' 
                ? 'bg-primary text-background' 
                : 'bg-surfaceBorder text-textMuted hover:text-textPrimary'
            }`}
          >
            Live (10 min)
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'history' 
                ? 'bg-primary text-background' 
                : 'bg-surfaceBorder text-textMuted hover:text-textPrimary'
            }`}
          >
            History (7 days)
          </button>
        </div>

        {/* Sensor Charts */}
        <div className="space-y-6">
          <SensorChart
            title="Temperature"
            value={reading.temperature_C}
            unit="°C"
            data={machineHistory}
            baseline={baseline?.temperature_C}
            color="#FF6B6B"
          />
          <SensorChart
            title="Vibration"
            value={reading.vibration_mm_s}
            unit="mm/s"
            data={machineHistory}
            baseline={baseline?.vibration_mm_s}
            color="#4ECDC4"
          />
          <SensorChart
            title="RPM"
            value={reading.rpm}
            unit=""
            data={machineHistory}
            baseline={baseline?.rpm}
            color="#FFE66D"
          />
          <SensorChart
            title="Current"
            value={reading.current_A}
            unit="A"
            data={machineHistory}
            baseline={baseline?.current_A}
            color="#95E1D3"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <button className="flex items-center gap-2 px-6 py-3 bg-primary text-background font-semibold rounded-lg hover:bg-primary/80 transition-colors">
            <Brain size={20} />
            Run Root Cause Analysis
          </button>
          <Link
            to="/predict"
            className="flex items-center gap-2 px-6 py-3 bg-surfaceBorder text-textPrimary font-semibold rounded-lg hover:bg-surfaceBorder/80 transition-colors"
          >
            <Clock size={20} />
            Predict Failure Time
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MachineDetailPage;
