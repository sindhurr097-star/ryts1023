import React from 'react';
import { Activity, TrendingUp, Filter, CheckCircle } from 'lucide-react';

const SignalProcessingProof = ({ signalProcessors, machineId }) => {
  const processor = signalProcessors?.[machineId]?.temperature_C;
  
  if (!processor) {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-primary" />
          <h3 className="font-semibold text-textPrimary">Noise Filtering Proof</h3>
        </div>
        <div className="text-sm text-textMuted text-center py-4">
          Signal processor not initialized
        </div>
      </div>
    );
  }

  const stats = processor.getStatistics();
  const comparison = processor.getBeforeAfterComparison();
  const anomalies = processor.history.anomalies.filter(a => a.isAnomaly);
  const dataCollected = processor.history.raw.length;

  if (!stats || !comparison) {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-primary" />
          <h3 className="font-semibold text-textPrimary">Noise Filtering Proof</h3>
        </div>
        <div className="text-sm text-textMuted text-center py-4">
          <div className="mb-2">Collecting data...</div>
          <div className="text-xs text-primary">Readings collected: {dataCollected}/20</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (dataCollected / 20) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Filter size={20} className="text-primary" />
        <h3 className="font-semibold text-textPrimary">Noise Filtering Proof</h3>
      </div>

      {/* Noise Reduction Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle size={16} className="text-green-600" />
          <span className="text-sm font-semibold text-green-800">Noise Reduction Achieved</span>
        </div>
        <div className="text-2xl font-bold text-green-700">
          {comparison.noiseReduction}
        </div>
        <div className="text-xs text-green-600 mt-1">
          Using Kalman Filter + Median Filter + Z-Score Detection
        </div>
      </div>

      {/* Before/After Comparison */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="text-xs font-semibold text-red-700 mb-2">Raw (Noisy)</div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-textMuted">Noise Level:</span>
              <span className="font-medium text-red-600">{comparison.rawNoise}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-textMuted">Std Dev:</span>
              <span className="font-medium text-red-600">{stats.raw.stdDev.toFixed(4)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-textMuted">Range:</span>
              <span className="font-medium text-red-600">
                {stats.raw.min.toFixed(2)} - {stats.raw.max.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-xs font-semibold text-green-700 mb-2">Filtered (Clean)</div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-textMuted">Noise Level:</span>
              <span className="font-medium text-green-600">{comparison.filteredNoise}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-textMuted">Std Dev:</span>
              <span className="font-medium text-green-600">{stats.kalman.stdDev.toFixed(4)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-textMuted">Range:</span>
              <span className="font-medium text-green-600">
                {stats.kalman.min.toFixed(2)} - {stats.kalman.max.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Anomaly Detection Stats */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity size={16} className="text-primary" />
          <span className="text-sm font-semibold text-primary">Anomaly Detection</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold text-primary">
              {stats.anomalyCount}
            </div>
            <div className="text-xs text-textMuted">Anomalies Detected</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">
              {stats.totalReadings}
            </div>
            <div className="text-xs text-textMuted">Total Readings</div>
          </div>
        </div>
      </div>

      {/* Algorithm Details */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="text-xs font-semibold text-textPrimary mb-2">Algorithms Used</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-textMuted">Kalman Filter - Optimal recursive estimation</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-textMuted">Median Filter - Spike removal</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span className="text-textMuted">Z-Score Detector - Statistical anomaly detection</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <span className="text-textMuted">IQR Detector - Robust outlier detection</span>
          </div>
        </div>
      </div>

      {/* Recent Anomalies */}
      {anomalies.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs font-semibold text-textPrimary mb-2">Recent Anomalies Removed</div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {anomalies.slice(-5).map((anomaly, index) => (
              <div key={index} className="bg-red-50 border border-red-200 rounded p-2">
                <div className="flex justify-between text-xs">
                  <span className="text-textMuted">Raw: {anomaly.raw.toFixed(2)}</span>
                  <span className="text-red-600 font-medium">Z-Score: {anomaly.zScore.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SignalProcessingProof;
