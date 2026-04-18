import { useState } from 'react';
import { Zap, Leaf } from 'lucide-react';
import { useMachineContext } from '../App';
import { getEnergySuggestions } from '../services/claudeService';
import ToastNotification from '../components/shared/ToastNotification';

const EnergyPage = () => {
  const [selectedMachine, setSelectedMachine] = useState('CNC_01');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [toast, setToast] = useState(null);

  const { latestReadings, machines, machineIds } = useMachineContext();

  const handleGetSuggestions = async () => {
    setLoading(true);
    setSuggestions(null);

    const reading = latestReadings[selectedMachine];
    const energyData = (reading?.current_A * reading?.rpm / 1000).toFixed(2);
    const operatingParams = {
      temperature: reading?.temperature_C,
      vibration: reading?.vibration_mm_s,
      rpm: reading?.rpm,
      current: reading?.current_A
    };

    const response = await getEnergySuggestions(
      selectedMachine,
      machines[selectedMachine]?.label,
      energyData,
      operatingParams
    );

    setLoading(false);

    if (response.error) {
      setToast({ message: response.error, type: 'error' });
    } else {
      setSuggestions(response.suggestions);
      setToast({ message: 'Energy suggestions generated', type: 'success' });
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700 border-green-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Hard': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const calculateEnergyEfficiency = () => {
    const reading = latestReadings[selectedMachine];
    const machineBaseline = machines[selectedMachine];
    
    if (!reading || !machineBaseline) return 0;
    
    const power = reading.current_A * reading.rpm / 1000;
    const baseline = machineBaseline.current_A.base * machineBaseline.rpm.base / 1000;
    
    // Prevent division by zero
    if (power === 0 || baseline === 0) return 100;
    
    const efficiency = ((baseline / power) * 100);
    return Math.min(100, Math.max(0, efficiency)).toFixed(1);
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Zap size={32} className="text-primary" />
          <div>
            <h1 className="font-display font-bold text-textPrimary text-2xl">Energy Efficiency</h1>
            <p className="text-textMuted">AI-powered energy optimization suggestions</p>
          </div>
        </div>

        {/* Machine Selector */}
        <div className="glass-card rounded-xl p-6 mb-6">
          <label className="block text-sm font-medium text-textMuted mb-2">Select Machine</label>
          <select
            value={selectedMachine}
            onChange={(e) => {
              setSelectedMachine(e.target.value);
              setSuggestions(null);
            }}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-textPrimary focus:outline-none focus:border-primary"
          >
            {machineIds.map(id => (
              <option key={id} value={id}>
                {machines[id]?.label} ({id})
              </option>
            ))}
          </select>

          {/* Energy Metrics */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold font-mono text-primary">
                {((latestReadings[selectedMachine]?.current_A * latestReadings[selectedMachine]?.rpm / 1000) || 0).toFixed(2)}
              </div>
              <div className="text-xs text-textMuted mt-1">Power (kW)</div>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold font-mono text-green-600">
                {calculateEnergyEfficiency()}%
              </div>
              <div className="text-xs text-textMuted mt-1">Efficiency</div>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold font-mono text-warning">
                {latestReadings[selectedMachine]?.riskScore || 0}
              </div>
              <div className="text-xs text-textMuted mt-1">Risk Score</div>
            </div>
          </div>

          <button
            onClick={handleGetSuggestions}
            disabled={loading}
            className="mt-6 w-full py-3 bg-primary text-background font-semibold rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                Analyzing energy patterns...
              </>
            ) : (
              <>
                <Leaf size={20} />
                Get Energy Suggestions
              </>
            )}
          </button>
        </div>

        {/* Suggestions */}
        {suggestions && !loading && (
          <div className="space-y-4">
            <h2 className="font-display font-semibold text-textPrimary text-lg">AI Recommendations</h2>
            {suggestions.map((suggestion, index) => (
              <div key={index} className="glass-card rounded-xl p-6 border-l-4 border-l-primary">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(suggestion.difficulty)}`}>
                        {suggestion.difficulty}
                      </span>
                      <span className="text-sm text-primary font-semibold">
                        {suggestion.savings}
                      </span>
                    </div>
                    <p className="text-textPrimary leading-relaxed">{suggestion.action}</p>
                  </div>
                </div>
              </div>
            ))}
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

export default EnergyPage;
