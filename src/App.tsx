import React from 'react';

// 예시 데이터 (실제 데이터는 아님)
const monthlyReturns: Record<string, number[]> = {
  "1980": [1.0, 2.5, -0.8, 0.9, 0.4, -1.2, 2.1, -3.0, 1.5, -2.0, 0.7, 1.8],
  "1981": [-2.5, 0.1, 6.6, 0.3, 1.8, 0.0, 3.6, 0.2, -0.2, -1.9, 3.4, 1.8],
  "1982": [1.9, 3.7, 0.1, 0.9, 1.2, 0.5, 1.9, 0.3, 1.9, 2.3, 1.2, 1.1],
  "1983": [5.7, -3.9, 2.4, 0.3, 2.2, 0.5, 3.6, 3.0, 0.1, -6.9, 1.8, -9.0],
  "1984": [7.9, 3.0, 1.9, 3.9, -6.6, 7.4, 1.4, -1.8, 1.2, 2.1, 3.4, 2.9],
  // ... (1985년부터 2024년까지의 예시 데이터 추가, 실제 데이터로 대체 필요)
  "2020": [-0.2, -8.4, -12.5, 12.7, 4.5, 1.8, 5.5, 7.0, -3.9, -2.8, 10.8, 3.7],
  "2021": [1.1, 2.8, 4.2, 5.2, 0.7, 2.2, 2.3, 3.0, -4.8, 6.9, -0.8, 4.4],
  "2022": [-5.3, -3.1, 3.6, -8.8, 0.2, -8.4, 9.1, -4.2, -9.3, 8.0, 5.4, -5.9],
  "2023": [6.2, -2.6, 3.5, 1.5, 0.3, 6.5, 3.1, -1.8, -4.9, -2.2, 5.6, 4.4],
  "2024": [1.5, 3.0, 0.9, 4.0, 2.5, 1.8, 2.0, 1.2, -0.5, 1.0, 2.3, 1.5],
};

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const commonStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '8px',
  textAlign: 'center'
};

const thStyle: React.CSSProperties = {
  ...commonStyle,
  background: '#f5f5f5'
};

const tdStyle: React.CSSProperties = {
  ...commonStyle
};

const SP500MonthlyTable: React.FC = () => {
  const years = Object.keys(monthlyReturns).sort();

  return (
    <div style={{ padding: '40px' }}>
      <h2>S&amp;P 500 Monthly Returns</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={thStyle}>Month</th>
            {years.map(year => (
              <th key={year} style={thStyle}>{year}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {months.map((month, i) => (
            <tr key={month}>
              <td style={tdStyle}><strong>{month}</strong></td>
              {years.map(year => (
                <td
                  key={year + i}
                  style={{
                    ...tdStyle,
                    backgroundColor: monthlyReturns[year][i] < 0 ? '#ffc0cb' : 'transparent'
                  }}
                >
                  {monthlyReturns[year][i].toFixed(2)}%
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SP500MonthlyTable;