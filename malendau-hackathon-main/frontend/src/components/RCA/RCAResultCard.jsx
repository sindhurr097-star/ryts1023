import { Copy, Plus, RotateCw } from 'lucide-react';

const RCAResultCard = ({ result, onCopy, onAddToReport, onReanalyze }) => {
  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'HIGH': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'MEDIUM': return 'bg-warning/20 text-warning border-warning/30';
      case 'LOW': return 'bg-danger/20 text-danger border-danger/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-semibold text-textPrimary text-xl">Analysis Results</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getConfidenceColor(result.confidence)}`}>
          {result.confidence} CONFIDENCE
        </span>
      </div>

      <div className="space-y-6">
        {/* Root Cause */}
        <div>
          <h4 className="font-semibold text-primary mb-2">Root Cause</h4>
          <p className="text-textPrimary leading-relaxed">{result.rootCause}</p>
        </div>

        {/* Failure Mechanism */}
        <div>
          <h4 className="font-semibold text-primary mb-2">Failure Mechanism</h4>
          <p className="text-textPrimary leading-relaxed">{result.mechanism}</p>
        </div>

        {/* Immediate Actions */}
        <div>
          <h4 className="font-semibold text-primary mb-2">Immediate Actions</h4>
          <ol className="list-decimal list-inside space-y-2 text-textPrimary">
            {result.actions.map((action, index) => (
              <li key={index} className="leading-relaxed">{action}</li>
            ))}
          </ol>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6 pt-6 border-t border-surfaceBorder">
        <button
          onClick={onCopy}
          className="flex items-center gap-2 px-4 py-2 bg-surfaceBorder text-textPrimary rounded-lg hover:bg-surfaceBorder/80 transition-colors"
        >
          <Copy size={16} />
          Copy
        </button>
        <button
          onClick={onAddToReport}
          className="flex items-center gap-2 px-4 py-2 bg-surfaceBorder text-textPrimary rounded-lg hover:bg-surfaceBorder/80 transition-colors"
        >
          <Plus size={16} />
          Add to Report
        </button>
        <button
          onClick={onReanalyze}
          className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors ml-auto"
        >
          <RotateCw size={16} />
          Re-analyze
        </button>
      </div>
    </div>
  );
};

export default RCAResultCard;
