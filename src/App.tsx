import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Typography
} from '@mui/material'; // MUI 컴포넌트 추가
import monthlyReturns from './data/monthlyReturns';
import './App.css'; // CSS 파일 가져오기
import TradingViewWidget from './components/TradingViewWidget'; // TradingView 컴포넌트 가져오기

const SP500MonthlyTable: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [returnsData, setReturnsData] = useState<Record<string, number[]>>(monthlyReturns);
  const [updatedCell, setUpdatedCell] = useState<{ year: string; month: number } | null>(null);

  // 현재 날짜 정보
  const now = new Date();
  const currentYear = now.getFullYear().toString();
  const currentMonth = now.getMonth(); // 0-based index (0 = January, 11 = December)

  // 언어 변경 함수
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng); // 언어 변경
  };

  const months = [
    t('months.january'),
    t('months.february'),
    t('months.march'),
    t('months.april'),
    t('months.may'),
    t('months.june'),
    t('months.july'),
    t('months.august'),
    t('months.september'),
    t('months.october'),
    t('months.november'),
    t('months.december')
  ];

  // 5초마다 API 호출
  useEffect(() => {
    const fetchGrowthRate = async () => {
      try {
        const response = await fetch('/api/proxy'); // API 엔드포인트 호출
        const data = await response.json();

        if (response.ok) {
          setReturnsData((prevData) => {
            const updatedData = { ...prevData };
            if (!updatedData[currentYear]) {
              updatedData[currentYear] = new Array(12).fill(null); // 12개월 초기화
            }
            updatedData[currentYear][currentMonth] = data.growthRate; // 현재 월에 growthRate 업데이트
            console.log('Updated Data:', updatedData); // 업데이트된 데이터 로그
            setUpdatedCell({ year: currentYear, month: currentMonth });

            return updatedData;
          });

          setTimeout(() => setUpdatedCell(null), 1000); // 1초 후 초기화
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
      {/* 우측 상단 드롭다운 메뉴 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <Select
          value={i18n.language}
          onChange={(e) => changeLanguage(e.target.value)}
          style={{ minWidth: '120px' }}
        >
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="ko">한국어</MenuItem>
          <MenuItem value="ja">日本語</MenuItem>
        </Select>
      </div>

      <Typography variant="h4" gutterBottom>
        {t('realTimeChart')}
      </Typography>

      <TradingViewWidget /> {/* TradingView 위젯 추가 */}

      <Typography variant="h5" gutterBottom>
        {t('monthlyReturns')}
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('year')}</TableCell>
              {months.map((month, i) => (
                <TableCell key={i} align="center">{month}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {years.map(y => (
              <TableRow key={y}>
                <TableCell component="th" scope="row">
                  <strong>{y}</strong>
                </TableCell>
                {months.map((_, i) => {
                  const value = returnsData[y][i];
                  const isUpdated = updatedCell?.year === y && updatedCell?.month === i;
                  return (
                    <TableCell
                      key={y + i}
                      align="center"
                      className={isUpdated ? 'updated-cell' : ''}
                    >
                      {value != null ? `${value.toFixed(2)}%` : '-'}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
            <TableRow>
              <TableCell>
                <strong>{t('average')}</strong>
              </TableCell>
              {monthlyAverages.map((value, i) => (
                <TableCell key={"avg" + i} align="center">
                  {value != null ? `${value.toFixed(2)}%` : '-'}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default SP500MonthlyTable;