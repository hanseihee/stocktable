import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Paper, Typography, Box } from '@mui/material';

interface DrawdownChartProps {
  symbol: string;
}

const DrawdownChart: React.FC<DrawdownChartProps> = ({ symbol }) => {
  const [drawdownData, setDrawdownData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrawdownData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/drawdown?symbol=${symbol}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch drawdown data');
        }

        setDrawdownData(data.drawdown);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (symbol) {
      fetchDrawdownData();
    }
  }, [symbol]);

  if (isLoading) {
    return <div>Loading drawdown data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Paper sx={{ p: 2, height: '300px' }}>
      <Typography variant="h6" gutterBottom>
        Maximum Drawdown
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={drawdownData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date"
            tickFormatter={(value) => new Date(value).getFullYear().toString()}
          />
          <YAxis
            tickFormatter={(value) => `${value}%`}
            domain={['dataMin', 'dataMax']}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(2)}%`, 'Drawdown']}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
          />
          <Line
            type="monotone"
            dataKey="drawdown"
            stroke="#ff0000"
            dot={false}
            strokeWidth={1.5}
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default DrawdownChart; 