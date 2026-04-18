import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Settings, Brain, Clock, FileText, MessageSquare, 
  Mic, Zap, ChevronRight, ChevronLeft, Menu, X
} from 'lucide-react';

const Sidebar = ({ collapsed, setCollapsed, latestReadings, machineIds }) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Settings, label: 'Machine Details', path: '/machine', hasSubmenu: true },
    { icon: Brain, label: 'AI Root Cause Analysis', path: '/rca' },
    { icon: Clock, label: 'Failure Prediction', path: '/predict' },
    { icon: FileText, label: 'Maintenance Report', path: '/report' },
    { icon: MessageSquare, label: 'AI Chatbot', path: '/chatbot' },
    { icon: Zap, label: 'Energy Efficiency', path: '/energy' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'warning': return 'bg-warning';
      case 'fault': return 'bg-danger';
      default: return 'bg-gray-500';
    }
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-surface border border-surfaceBorder rounded-lg text-primary"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full bg-[#0D0D14] border-r border-surfaceBorder z-50
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Toggle button */}
        <div className="p-4 border-b border-surfaceBorder">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center justify-center p-2 rounded-lg hover:bg-surfaceBorder transition-colors"
          >
            {collapsed ? <ChevronRight size={20} className="text-primary" /> : <ChevronLeft size={20} className="text-primary" />}
          </button>
        </div>

        {/* Logo */}
        <div className="p-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Zap className="text-primary" size={24} />
              <span className="font-display font-bold text-primary text-lg">
                JnanikAI
              </span>
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center">
              <Zap className="text-primary" size={24} />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          {menuItems.map((item) => (
            <div key={item.path}>
              <Link
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                  ${isActive(item.path) 
                    ? 'bg-primary/10 border-l-2 border-primary text-primary' 
                    : 'text-textMuted hover:bg-surfaceBorder hover:text-textPrimary'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <item.icon size={20} />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </Link>

              {/* Machine submenu */}
              {item.hasSubmenu && !collapsed && isActive(item.path) && (
                <div className="ml-8 mt-1 space-y-1">
                  {machineIds.map((machineId) => {
                    const reading = latestReadings[machineId];
                    const status = reading?.status || 'running';
                    return (
                      <Link
                        key={machineId}
                        to={`/machine/${machineId}`}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-textMuted hover:bg-surfaceBorder hover:text-textPrimary transition-colors"
                      >
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
                        <span>{machineId}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Voice module shortcut */}
        <div className="p-4 border-t border-surfaceBorder">
          <button
            className={`
              flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
              w-full text-textMuted hover:bg-surfaceBorder hover:text-textPrimary
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <Mic size={20} />
            {!collapsed && <span className="font-medium">Voice</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
