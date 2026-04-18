import { useState, useRef, useEffect } from 'react';
import { Bell, X, Check } from 'lucide-react';

const AlertBell = ({ alerts, markAllRead, unreadCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'fault': return 'text-danger border-danger';
      case 'warning': return 'text-warning border-warning';
      default: return 'text-textMuted border-gray-300';
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Bell size={24} className="text-textPrimary" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-danger text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-textPrimary">Alerts</h3>
            <button
              onClick={() => {
                markAllRead();
                setIsOpen(false);
              }}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <Check size={16} />
              Mark all read
            </button>
          </div>

          {/* Alert list */}
          <div className="max-h-96 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-textMuted">
                <p>All machines operating normally</p>
              </div>
            ) : (
              alerts.slice(0, 10).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border-l-4 ${getSeverityColor(alert.severity)} border-b border-gray-200 hover:bg-gray-50 transition-colors`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-textPrimary">{alert.machine_label}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          alert.severity === 'fault' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'
                        }`}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-textMuted">
                        {alert.sensor?.replace('_', ' ').toUpperCase()}: {alert.value?.toFixed(2)}
                      </p>
                      <p className="text-xs text-textMuted mt-1">{formatTimestamp(alert.timestamp)}</p>
                    </div>
                    {!alert.read && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {alerts.length > 10 && (
            <div className="p-3 text-center text-sm text-textMuted border-t border-gray-200">
              Showing 10 of {alerts.length} alerts
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlertBell;
