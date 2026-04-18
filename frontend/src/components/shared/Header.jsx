import { useState, useEffect } from 'react';
import { Bell, Zap } from 'lucide-react';
import AlertBell from './AlertBell';

const Header = ({ alerts, markAllRead, toggleSidebar }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-6 shadow-sm">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <h1 className="font-display font-bold text-primary text-xl flex items-center gap-2">
          <Zap size={24} />
          Sense AI - Detect - Predict - Prevent
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">
        {/* Clock */}
        <div className="font-mono text-textPrimary text-lg">
          {formatTime(time)}
        </div>

        {/* Alert Bell */}
        <AlertBell alerts={alerts} markAllRead={markAllRead} unreadCount={unreadCount} />
      </div>
    </header>
  );
};

export default Header;
