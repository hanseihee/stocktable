import React, { useEffect, useState } from 'react';
import TradingViewWidget from './components/TradingViewWidget'; 
import monthlyReturns from './data/monthlyReturns';
import './App.css'; // CSS 파일 추가

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
  const [returnsData, setReturnsData] = useState<Record<string, number[]>>(monthlyReturns);
  const [growthRate, setGrowthRate] = useState<number | null>(null);
  const [updatedCell, setUpdatedCell] = useState<{ year: string; month: number } | null>(null);

  // 현재 날짜 정보
  const now = new Date();
  const currentYear = now.getFullYear().toString();
  const currentMonth = now.getMonth(); // 0-based index (0 = January, 11 = December)

  // 5초마다 API 호출
  useEffect(() => {
    const fetchGrowthRate = async () => {
      try {
        const response = await fetch('/api/proxy'); // API 엔드포인트 호출
        const data = await response.json();

        if (response.ok) {
          setGrowthRate(data.growthRate);

          // returnsData 업데이트
          setReturnsData((prevData) => {
            const updatedData = { ...prevData };
            if (!updatedData[currentYear]) {
              updatedData[currentYear] = new Array(12).fill(null); // 12개월 초기화
            }
            updatedData[currentYear][currentMonth] = data.growthRate; // 현재 월에 growthRate 업데이트

            // 업데이트된 셀 설정
            setUpdatedCell({ year: currentYear, month: currentMonth });

            return updatedData;
          });
        } else {
          console.error('API 오류:', data.error);
        }
      } catch (error) {
        console.error('API 호출 실패:', error);
      }
    };

    fetchGrowthRate(); // 초기 호출
    const interval = setInterval(fetchGrowthRate, 5000); // 5초마다 호출

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 인터벌 정리
  }, [currentYear, currentMonth]);

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
                  const isUpdated = updatedCell?.year === y && updatedCell?.month === i;
                  return (
                    <td
                      key={y + i}
                      style={{ ...tdStyle, backgroundColor: bgColor }}
                      className={isUpdated ? 'updated-cell' : ''}
                    >
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