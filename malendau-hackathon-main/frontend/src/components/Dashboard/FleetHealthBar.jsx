const FleetHealthBar = ({ latestReadings, machineIds }) => {
  const getStatusCount = () => {
    let running = 0;
    let warning = 0;
    let fault = 0;

    machineIds.forEach(id => {
      const status = latestReadings[id]?.status || 'running';
      if (status === 'running') running++;
      else if (status === 'warning') warning++;
      else if (status === 'fault') fault++;
    });

    return { running, warning, fault, total: machineIds.length };
  };

  const { running, warning, fault, total } = getStatusCount();
  const healthyCount = running;

  const runningPercent = (running / total) * 100;
  const warningPercent = (warning / total) * 100;
  const faultPercent = (fault / total) * 100;

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display font-semibold text-textPrimary text-lg">
            Fleet Health
          </h2>
          <p className="text-sm text-textMuted">
            {healthyCount}/{total} machines healthy
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-textMuted">Running</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-textMuted">Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-danger" />
            <span className="text-textMuted">Fault</span>
          </div>
        </div>
      </div>

      {/* Health Bar */}
      <div className="h-4 bg-surfaceBorder rounded-full overflow-hidden flex">
        {running > 0 && (
          <div
            className="bg-green-500 transition-all duration-500"
            style={{ width: `${runningPercent}%` }}
          />
        )}
        {warning > 0 && (
          <div
            className="bg-warning transition-all duration-500"
            style={{ width: `${warningPercent}%` }}
          />
        )}
        {fault > 0 && (
          <div
            className="bg-danger transition-all duration-500"
            style={{ width: `${faultPercent}%` }}
          />
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{running}</div>
          <div className="text-xs text-textMuted">Running</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-warning">{warning}</div>
          <div className="text-xs text-textMuted">Warning</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-danger">{fault}</div>
          <div className="text-xs text-textMuted">Fault</div>
        </div>
      </div>
    </div>
  );
};

export default FleetHealthBar;
