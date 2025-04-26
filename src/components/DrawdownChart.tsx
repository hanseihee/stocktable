import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Paper, Typography } from '@mui/material';
import monthlyReturnsData from '../data/monthlyReturn.json';

interface DrawdownChartProps {
  symbol: string;
}

interface ChartDataPoint {
  date: string;
  drawdown: number;
}

interface MonthlyReturnsData {
  [year: string]: number[];
}

const calculateDrawdown = (monthlyReturns: number[]): number[] => {
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

const DrawdownChart: React.FC<DrawdownChartProps> = ({ symbol }) => {
  // Get the last 20 years of data
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 20;
  
  // Filter years and prepare data
  const years = Object.keys(monthlyReturnsData as MonthlyReturnsData)
    .filter(year => parseInt(year) >= startYear)
    .sort();
  
  // Calculate drawdown for each month
  const allMonthlyReturns: number[] = [];
  years.forEach(year => {
    const yearData = (monthlyReturnsData as MonthlyReturnsData)[year];
    allMonthlyReturns.push(...yearData.filter((val: number | null): val is number => val !== null));
  });
  
  const drawdowns = calculateDrawdown(allMonthlyReturns);
  
  // Create data points with dates
  const chartData: ChartDataPoint[] = [];
  let monthIndex = 0;
  
  years.forEach(year => {
    const yearData = (monthlyReturnsData as MonthlyReturnsData)[year];
    yearData.forEach((_: number | null, month: number) => {
      if (drawdowns[monthIndex] !== undefined) {
        chartData.push({
          date: new Date(parseInt(year), month).toISOString(),
          drawdown: drawdowns[monthIndex]
        });
        monthIndex++;
      }
    });
  });

  return (
    <Paper sx={{ p: 2, height: '300px' }}>
      <Typography variant="h6" gutterBottom>
        Maximum Drawdown (Last 20 Years)
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
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
          />
          <YAxis
            tickFormatter={(value) => `${value.toFixed(1)}%`}
            domain={['dataMin', Math.max(0, Math.ceil(Math.max(...drawdowns)))]}
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
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default DrawdownChart; 