import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';

const SensorChart = ({ title, value, unit, data, baseline, color = '#00E5FF' }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Map title to the correct data key
  const dataKeyMap = {
    'Temperature': 'temperature_C',
    'Vibration': 'vibration_mm_s',
    'RPM': 'rpm',
    'Current': 'current_A'
  };

  const dataKey = dataKeyMap[title] || title.toLowerCase().replace(' ', '_');

  const chartData = data?.timestamps?.map((ts, i) => ({
    time: formatTime(ts),
    value: data[dataKey]?.[i] || 0,
    timestamp: ts
  })) || [];

  const workingScore = Math.max(0, Math.min(100, 100 - ((value - baseline?.base || 0) / (baseline?.threshold || 100) * 100)));

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-textPrimary text-lg">{title}</h3>
          <p className="text-sm text-textMuted">
            Score: {workingScore.toFixed(0)}/100 — {workingScore > 70 ? 'Normal' : workingScore > 40 ? 'Elevated' : 'Critical'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold font-mono" style={{ color }}>
            {typeof value === 'number' ? value.toFixed(1) : value}
          </div>
          <div className="text-sm text-textMuted">{unit}</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" />
          <XAxis 
            dataKey="time" 
            stroke="#6B7280"
            fontSize={12}
            tickFormatter={(value) => value.split(':').slice(0, 2).join(':')}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#12121A', 
              border: '1px solid #1E1E2E',
              borderRadius: '8px'
            }}
            itemStyle={{ color: '#F0F0F0' }}
            labelFormatter={(value) => `Time: ${value}`}
            formatter={(value) => [`${value.toFixed(2)} ${unit}`, title]}
          />
          <ReferenceArea 
            y1={baseline?.min} 
            y2={baseline?.max} 
            fill={color} 
            fillOpacity={0.1}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2}
            dot={false}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SensorChart;
