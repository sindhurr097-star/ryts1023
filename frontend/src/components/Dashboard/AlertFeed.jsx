import { X, AlertTriangle } from 'lucide-react';

const AlertFeed = ({ alerts, onDismiss }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'fault': return 'border-danger bg-red-50';
      case 'warning': return 'border-warning bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'fault': return 'bg-danger text-white';
      case 'warning': return 'bg-warning text-black';
      default: return 'bg-gray-400 text-white';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const unreadAlerts = alerts.filter(a => !a.read);

  return (
    <div className="glass-card rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-textPrimary text-lg flex items-center gap-2">
          <AlertTriangle size={20} className="text-warning" />
          Live Alerts
        </h2>
        <span className="text-sm text-textMuted">
          {unreadAlerts.length} unread
        </span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-textMuted">
            <p>All machines operating normally</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${getSeverityColor(alert.severity)} transition-all`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-textPrimary text-sm">
                        {alert.machine_label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${getSeverityBadge(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-textMuted">
                      {alert.sensor?.replace('_', ' ').toUpperCase()}: {alert.value?.toFixed(2)}
                    </p>
                    <p className="text-xs text-textMuted mt-1">
                      {formatTimestamp(alert.timestamp)}
                    </p>
                  </div>
                  {!alert.read && (
                    <button
                      onClick={() => onDismiss(alert.id)}
                      className="text-textMuted hover:text-textPrimary transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertFeed;
