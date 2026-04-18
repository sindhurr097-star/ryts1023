import { useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { useMachineContext } from '../App';
import { predictFailure } from '../services/claudeService';
import ToastNotification from '../components/shared/ToastNotification';

const FailurePredictionPage = () => {
  const [selectedMachine, setSelectedMachine] = useState('CNC_01');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [toast, setToast] = useState(null);

  const { latestReadings, machines, history, machineIds } = useMachineContext();

  const handlePredict = async () => {
    setLoading(true);
    setPrediction(null);

    const machineHistory = history[selectedMachine];
    const trendData = {
      temperature: machineHistory?.temperature_C?.slice(-30) || [],
      vibration: machineHistory?.vibration_mm_s?.slice(-30) || [],
      rpm: machineHistory?.rpm?.slice(-30) || [],
      current: machineHistory?.current_A?.slice(-30) || []
    };

    const response = await predictFailure(
      selectedMachine,
      machines[selectedMachine]?.label,
      trendData
    );

    setLoading(false);

    if (response.error) {
      setToast({ message: response.error, type: 'error' });
    } else {
      setPrediction(response);
      setToast({ message: 'Prediction completed', type: 'success' });
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'CRITICAL': return 'bg-danger text-white';
      case 'HIGH': return 'bg-warning text-black';
      case 'MODERATE': return 'bg-primary/20 text-primary';
      case 'LOW': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleScheduleMaintenance = () => {
    const slot = new Date();
    slot.setDate(slot.getDate() + 1);
    slot.setHours(9, 0, 0, 0);
    
    setToast({ 
      message: `Maintenance scheduled: Tomorrow ${slot.toLocaleTimeString()} — Slot #MT-${Math.floor(Math.random() * 9999)}`, 
      type: 'success' 
    });
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Clock size={32} className="text-primary" />
          <div>
            <h1 className="font-display font-bold text-textPrimary text-2xl">Failure Time Prediction</h1>
            <p className="text-textMuted">AI-powered estimation of time to failure</p>
          </div>
        </div>

        {/* Machine Selector */}
        <div className="glass-card rounded-xl p-6 mb-6">
          <label className="block text-sm font-medium text-textMuted mb-2">Select Machine</label>
          <select
            value={selectedMachine}
            onChange={(e) => {
              setSelectedMachine(e.target.value);
              setPrediction(null);
            }}
            className="w-full bg-surface border border-surfaceBorder rounded-lg px-4 py-3 text-textPrimary focus:outline-none focus:border-primary"
          >
            {machineIds.map(id => (
              <option key={id} value={id}>
                {machines[id]?.label} ({id})
              </option>
            ))}
          </select>

          <button
            onClick={handlePredict}
            disabled={loading}
            className="mt-4 w-full py-3 bg-primary text-background font-semibold rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                AI is analyzing trend data...
              </>
            ) : (
              'Predict with AI'
            )}
          </button>
        </div>

        {/* Prediction Result */}
        {prediction && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Panel - Prediction Card */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-display font-semibold text-textPrimary text-lg mb-4">
                Prediction Result
              </h3>
              
              <div className="text-center mb-6">
                <div className="text-4xl font-mono font-bold text-primary mb-2">
                  {prediction.timeEstimate}
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getUrgencyColor(prediction.urgency)}`}>
                  {prediction.urgency} URGENCY
                </span>
              </div>

              <div className="bg-surfaceBorder rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-textMuted mb-2">AI Reasoning</h4>
                <p className="text-textPrimary text-sm leading-relaxed">{prediction.reasoning}</p>
              </div>

              <button
                onClick={handlePredict}
                className="w-full py-2 bg-surfaceBorder text-textPrimary rounded-lg hover:bg-surfaceBorder/80 transition-colors"
              >
                Refresh Prediction
              </button>
            </div>

            {/* Right Panel - Action */}
            <div className="glass-card rounded-xl p-6 flex flex-col justify-center">
              <div className="text-center mb-6">
                <AlertTriangle size={48} className="text-warning mx-auto mb-4" />
                <h3 className="font-display font-semibold text-textPrimary text-lg mb-2">
                  Take Action
                </h3>
                <p className="text-textMuted text-sm">
                  Schedule maintenance before predicted failure to prevent downtime
                </p>
              </div>

              <button
                onClick={handleScheduleMaintenance}
                className="w-full py-3 bg-primary text-background font-semibold rounded-lg hover:bg-primary/80 transition-colors"
              >
                Schedule Maintenance Before Failure
              </button>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <ToastNotification
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default FailurePredictionPage;
