import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Paper, Typography, CircularProgress, Box } from '@mui/material';
import monthlyReturnsData from '../data/monthlyReturn.json';

interface DrawdownChartProps {
  symbol: string;
  monthlyReturns?: Record<string, number[]>;
}

interface ChartDataPoint {
  date: string;
  drawdown: number;
}

const calculateDrawdown = (monthlyReturns: number[]): number[] => {
  if (monthlyReturns.length === 0) return [];

  let peak = 100; // Start with base 100
  let currentValue = 100;
  const drawdowns: number[] = [];

  for (const monthReturn of monthlyReturns) {
    // Calculate new value based on monthly return
    currentValue = currentValue * (1 + monthReturn / 100);
    
    // Update peak if we have a new high
    peak = Math.max(peak, currentValue);
    
    // Calculate drawdown percentage
    const drawdownPercent = ((currentValue - peak) / peak) * 100;
    drawdowns.push(drawdownPercent);
  }

  return drawdowns;
};

const DrawdownChart: React.FC<DrawdownChartProps> = ({ symbol, monthlyReturns }) => {
  // If no data is provided, show loading state
  if (!monthlyReturns || Object.keys(monthlyReturns).length === 0) {
    return (
      <Paper sx={{ p: 2, height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress />
          <Typography variant="body1">Loading drawdown data...</Typography>
        </Box>
      </Paper>
    );
  }

  // Get the last 20 years of data
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 20;
  
  // Filter years and prepare data
  const years = Object.keys(monthlyReturns)
    .filter(year => parseInt(year) >= startYear)
    .sort();
  
  // Calculate drawdown for each month
  const allMonthlyReturns: number[] = [];
  years.forEach(year => {
    const yearData = monthlyReturns[year];
    if (Array.isArray(yearData)) {
      const validReturns = yearData.filter((val: number | null): val is number => 
        val !== null && !isNaN(val) && isFinite(val)
      );
      allMonthlyReturns.push(...validReturns);
    }
  });
  
  const drawdowns = calculateDrawdown(allMonthlyReturns);
  
  // Create data points with dates
  const chartData: ChartDataPoint[] = [];
  let monthIndex = 0;
  
  years.forEach(year => {
    const yearData = monthlyReturns[year];
    if (Array.isArray(yearData)) {
      yearData.forEach((_: number | null, month: number) => {
        if (drawdowns[monthIndex] !== undefined) {
          chartData.push({
            date: new Date(parseInt(year), month).toISOString(),
            drawdown: drawdowns[monthIndex]
          });
          monthIndex++;
        }
      });
    }
  });

  if (chartData.length === 0) {
    return (
      <Paper sx={{ p: 2, height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="error">
          No data available for the selected period
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, height: '300px' }}>
      <Typography variant="h6" gutterBottom>
        Maximum Drawdown (Last 20 Years)
      </Typography>
      <ResponsiveContainer width="100%" height="80%">
        <LineChart
          data={chartData}
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
            type="category"
            domain={['dataMin', 'dataMax']}
          />
          <YAxis
            tickFormatter={(value) => `${value.toFixed(1)}%`}
            domain={[Math.floor(Math.min(...drawdowns)), 0]}
            type="number"
          />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(2)}%`, 'Drawdown']}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
          />
          <Line
            type="monotone"
            dataKey="drawdown"
            stroke="#2196f3"
            dot={false}
            strokeWidth={1.5}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default DrawdownChart; 