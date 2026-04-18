const RiskGauge = ({ score, size = 80 }) => {
  const getColor = () => {
    if (score >= 70) return '#FF3D3D';
    if (score >= 40) return '#FFB300';
    return '#00E5FF';
  };

  const getLabel = () => {
    if (score >= 70) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  };

  const circumference = 2 * Math.PI * (size / 2 - 8);
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 8}
          stroke="#1E1E2E"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 8}
          stroke={getColor()}
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-bold font-mono" style={{ color: getColor() }}>
          {score}
        </span>
        <span className="text-xs text-textMuted">RISK</span>
      </div>
    </div>
  );
};

export default RiskGauge;
