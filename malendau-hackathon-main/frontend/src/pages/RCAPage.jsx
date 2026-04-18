import { useState } from 'react';
import { Brain } from 'lucide-react';
import { useMachineContext } from '../App';
import { getRCA } from '../services/claudeService';
import RCAResultCard from '../components/RCA/RCAResultCard';
import ToastNotification from '../components/shared/ToastNotification';

const RCAPage = () => {
  const [selectedMachine, setSelectedMachine] = useState('CNC_01');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);

  const { latestReadings, machines, history, machineIds } = useMachineContext();

  const handleRunRCA = async () => {
    setLoading(true);
    setResult(null);

    const reading = latestReadings[selectedMachine];
    const machineHistory = history[selectedMachine];
    const recentTrend = {
      temperature: machineHistory?.temperature_C?.slice(-5) || [],
      vibration: machineHistory?.vibration_mm_s?.slice(-5) || [],
      rpm: machineHistory?.rpm?.slice(-5) || [],
      current: machineHistory?.current_A?.slice(-5) || []
    };

    const sensorSnapshot = {
      temperature_C: reading?.temperature_C,
      vibration_mm_s: reading?.vibration_mm_s,
      rpm: reading?.rpm,
      current_A: reading?.current_A
    };

    const response = await getRCA(
      selectedMachine,
      machines[selectedMachine]?.label,
      sensorSnapshot,
      recentTrend
    );

    setLoading(false);

    if (response.error) {
      setToast({ message: response.error, type: 'error' });
    } else {
      setResult(response);
      setToast({ message: 'RCA analysis completed successfully', type: 'success' });
    }
  };

  const handleCopy = () => {
    const text = `
Root Cause: ${result?.rootCause}
Failure Mechanism: ${result?.mechanism}
Immediate Actions:
${result?.actions?.map((a, i) => `${i + 1}. ${a}`).join('\n')}
    `.trim();
    
    navigator.clipboard.writeText(text);
    setToast({ message: 'Copied to clipboard', type: 'success' });
  };

  const handleAddToReport = () => {
    setToast({ message: 'Added to report queue', type: 'success' });
  };

  const getStatusMessage = () => {
    const status = latestReadings[selectedMachine]?.status;
    if (status === 'running') {
      return 'No active anomalies detected. RCA is most useful during warning or fault states. You may still run a precautionary analysis.';
    }
    return null;
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Brain size={32} className="text-primary" />
          <div>
            <h1 className="font-display font-bold text-textPrimary text-2xl">AI Root Cause Analysis</h1>
            <p className="text-textMuted">Identify the underlying cause of machine anomalies</p>
          </div>
        </div>

        {/* Machine Selector */}
        <div className="glass-card rounded-xl p-6 mb-6">
          <label className="block text-sm font-medium text-textMuted mb-2">Select Machine</label>
          <select
            value={selectedMachine}
            onChange={(e) => {
              setSelectedMachine(e.target.value);
              setResult(null);
            }}
            className="w-full bg-surface border border-surfaceBorder rounded-lg px-4 py-3 text-textPrimary focus:outline-none focus:border-primary"
          >
            {machineIds.map(id => (
              <option key={id} value={id}>
                {machines[id]?.label} ({id})
              </option>
            ))}
          </select>

          {/* Sensor Snapshot */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-textMuted mb-3">Current Sensor Snapshot</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-surfaceBorder rounded-lg p-3">
                <div className="text-xs text-textMuted">Temperature</div>
                <div className="text-lg font-mono font-semibold text-textPrimary">
                  {latestReadings[selectedMachine]?.temperature_C?.toFixed(1)}°C
                </div>
              </div>
              <div className="bg-surfaceBorder rounded-lg p-3">
                <div className="text-xs text-textMuted">Vibration</div>
                <div className="text-lg font-mono font-semibold text-textPrimary">
                  {latestReadings[selectedMachine]?.vibration_mm_s?.toFixed(2)} mm/s
                </div>
              </div>
              <div className="bg-surfaceBorder rounded-lg p-3">
                <div className="text-xs text-textMuted">RPM</div>
                <div className="text-lg font-mono font-semibold text-textPrimary">
                  {latestReadings[selectedMachine]?.rpm}
                </div>
              </div>
              <div className="bg-surfaceBorder rounded-lg p-3">
                <div className="text-xs text-textMuted">Current</div>
                <div className="text-lg font-mono font-semibold text-textPrimary">
                  {latestReadings[selectedMachine]?.current_A?.toFixed(1)}A
                </div>
              </div>
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={handleRunRCA}
            disabled={loading}
            className="mt-6 w-full py-3 bg-primary text-background font-semibold rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                Analyzing sensor patterns...
              </>
            ) : (
              'Run RCA Analysis'
            )}
          </button>
        </div>

        {/* Status Message */}
        {getStatusMessage() && !result && (
          <div className="glass-card rounded-xl p-6 mb-6 border-l-4 border-primary">
            <p className="text-textPrimary">{getStatusMessage()}</p>
          </div>
        )}

        {/* Result Card */}
        {result && !loading && (
          <RCAResultCard
            result={result}
            onCopy={handleCopy}
            onAddToReport={handleAddToReport}
            onReanalyze={handleRunRCA}
          />
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

export default RCAPage;
