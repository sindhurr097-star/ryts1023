import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const SparklineChart = ({ data, color = '#00E5FF', height = 60 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <XAxis hide />
        <YAxis hide domain={['auto', 'auto']} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#12121A', 
            border: '1px solid #1E1E2E',
            borderRadius: '8px'
          }}
          itemStyle={{ color: '#F0F0F0' }}
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
  );
};

export default SparklineChart;
