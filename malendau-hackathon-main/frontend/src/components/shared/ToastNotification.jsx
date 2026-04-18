import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const ToastNotification = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="text-primary" size={20} />;
      case 'warning': return <AlertTriangle className="text-warning" size={20} />;
      case 'error': return <XCircle className="text-danger" size={20} />;
      default: return <CheckCircle className="text-primary" size={20} />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success': return 'border-primary';
      case 'warning': return 'border-warning';
      case 'error': return 'border-danger';
      default: return 'border-primary';
    }
  };

  return (
    <div className={`
      fixed top-20 right-4 z-50
      bg-surface border-l-4 ${getBorderColor()} border border-surfaceBorder
      rounded-lg shadow-xl p-4 flex items-center gap-3
      transition-all duration-300
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      {getIcon()}
      <span className="text-textPrimary">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-2 text-textMuted hover:text-textPrimary transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default ToastNotification;
