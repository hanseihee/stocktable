import React, { useEffect, useState } from 'react';
import TradingViewWidget from './components/TradingViewWidget'; 
import monthlyReturns from './data/monthlyReturns';

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const commonStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '8px',
  textAlign: 'center',
  whiteSpace: 'nowrap'
};

const thStyle: React.CSSProperties = {
  ...commonStyle,
  background: '#f5f5f5'
};

const tdStyle: React.CSSProperties = {
  ...commonStyle
};

const getCellColor = (value: number | null): string => {
  if (value != null) {
    if (value > 5) return '#90ee90';
    if (value > 0) return '#d0f0c0';
    if (value < -5) return '#ff7f7f';
    if (value < 0) return '#ffc0cb';
  }
  return 'transparent';
};

const SP500MonthlyTable: React.FC = () => {
  const [returnsData] = useState<Record<string, number[]>>(monthlyReturns);
  const [latestPrice, setLatestPrice] = useState<number | null>(null);
  const [monthStartPrice, setMonthStartPrice] = useState<number | null>(null);
  const [growthRate, setGrowthRate] = useState<number | null>(null);

  // API 호출
  useEffect(() => {
    const fetchSP500Data = async () => {
      try {
        console.log('API2 호출됨: /api/proxy');
        const response = await fetch('/api/proxy'); // API 엔드포인트 호출
        console.log(response);
        const data = await response.json();

        if (response.ok) {
          setLatestPrice(data.latestPrice);
          setMonthStartPrice(data.monthStartPrice);
          setGrowthRate(data.growthRate);
        } else {
          console.error('API 오류:', data.error);
        }
      } catch (error) {
        console.error('API 호출 실패:', error);
      }
    };

    fetchSP500Data();
  }, []);

  const years = Object.keys(returnsData).sort((a, b) => Number(b) - Number(a));

  const monthlyAverages = months.map((_, i) => {
    const values = years.map(y => returnsData[y][i]).filter(v => v != null);
    const sum = values.reduce((a, b) => a + b, 0);
    return values.length ? sum / values.length : null;
  });

  return (
    <div style={{ padding: '20px' }}>
      <h2>S&amp;P 500 (SPY) Real-Time Chart</h2>
      <TradingViewWidget />

      <h2>Real-Time S&amp;P 500 Data</h2>
      <div>
        <p>Latest Price: {latestPrice !== null ? `$${latestPrice.toFixed(2)}` : 'Loading...'}</p>
        <p>Month Start Price: {monthStartPrice !== null ? `$${monthStartPrice.toFixed(2)}` : 'Loading...'}</p>
        <p>Growth Rate: {growthRate !== null ? `${growthRate.toFixed(2)}%` : 'Loading...'}</p>
      </div>

      <h2>S&amp;P 500 Monthly Returns</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', minWidth: '1000px' }}>
          <thead>
            <tr>
              <th style={thStyle}>Year</th>
              {months.map((month, i) => (
                <th key={i} style={thStyle}>{month}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {years.map(y => (
              <tr key={y}>
                <td style={tdStyle}><strong>{y}</strong></td>
                {months.map((_, i) => {
                  const value = returnsData[y][i];
                  const bgColor = getCellColor(value);
                  return (
                    <td key={y + i} style={{ ...tdStyle, backgroundColor: bgColor }}>
                      {value != null ? `${value.toFixed(2)}%` : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td style={{ ...tdStyle, fontWeight: 'bold' }}>Average</td>
              {monthlyAverages.map((value, i) => {
                const bgColor = getCellColor(value);
                return (
                  <td key={"avg" + i} style={{ ...tdStyle, backgroundColor: bgColor }}>
                    {value != null ? `${value.toFixed(2)}%` : '-' }
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SP500MonthlyTable;