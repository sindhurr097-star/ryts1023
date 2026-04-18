import React from 'react';
import { AlertTriangle, TrendingUp, Activity, Clock } from 'lucide-react';

const AnomalyInsights = ({ anomalyHistory, anomalyState, machines }) => {
  const getSensorName = (sensor) => {
    const names = {
      temperature_C: 'Temperature',
      vibration_mm_s: 'Vibration',
      rpm: 'RPM',
      current_A: 'Current'
    };
    return names[sensor] || sensor;
  };

  const activeAnomalies = Object.entries(anomalyState || {}).filter(([_, anomaly]) => anomaly?.active);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-danger bg-red-50 border-red-200';
      case 'high': return 'text-warning bg-yellow-50 border-yellow-200';
      case 'medium': return 'text-primary bg-blue-50 border-blue-200';
      default: return 'text-textMuted bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle size={24} className="text-warning" />
        <h3 className="font-display font-semibold text-textPrimary text-lg">Anomaly Insights</h3>
      </div>

      {/* Active Anomalies */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={16} className="text-primary" />
          <span className="text-sm font-medium text-textPrimary">Active Anomalies</span>
        </div>
        {Object.entries(anomalyState || {}).filter(([_, anomaly]) => anomaly?.active).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(anomalyState || {})
              .filter(([_, anomaly]) => anomaly?.active)
              .map(([machineId, anomaly], index) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium text-textPrimary">
                      {machines?.[machineId]?.label || machineId}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded border ${getSeverityColor('critical')}`}>
                      ACTIVE
                    </span>
                  </div>
                  <div className="text-xs text-textMuted">
                    {getSensorName(anomaly.sensor)} anomaly detected
                  </div>
                  <div className="text-xs text-textMuted mt-1">
                    Duration: {anomaly.remaining}s remaining
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-sm text-textMuted text-center py-4 bg-gray-50 rounded-lg">
            No active anomalies
          </div>
        )}
      </div>

      {/* Recent Anomalies */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock size={16} className="text-primary" />
          <span className="text-sm font-medium text-textPrimary">Recent Anomalies (Last 10)</span>
        </div>
        {anomalyHistory && anomalyHistory.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {anomalyHistory.slice(0, 10).map((anomaly, index) => (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium text-textPrimary">
                    {anomaly.machineLabel}
                  </span>
                  <span className="text-xs text-textMuted">
                    {new Date(anomaly.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-xs text-textMuted">
                  {getSensorName(anomaly.sensor)} spike detected
                </div>
                <div className="text-xs text-textMuted mt-1">
                  Peak value: {anomaly.peakValue?.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-textMuted text-center py-4 bg-gray-50 rounded-lg">
            No recent anomalies
          </div>
        )}
      </div>

      {/* Anomaly Statistics */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold font-mono text-danger">
              {anomalyHistory?.length || 0}
            </div>
            <div className="text-xs text-textMuted">Total Anomalies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold font-mono text-warning">
              {activeAnomalies?.length || 0}
            </div>
            <div className="text-xs text-textMuted">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold font-mono text-primary">
              {anomalyHistory?.filter(a => a.machineId === 'CNC_01').length || 0}
            </div>
            <div className="text-xs text-textMuted">CNC_01</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnomalyInsights;
