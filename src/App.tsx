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
  Typography,
  Switch,
  FormControlLabel,
  CssBaseline
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Helmet } from 'react-helmet';
import monthlyReturnsData from './data/monthlyReturn.json'; // JSON 파일 가져오기
import './App.css';
import TradingViewWidget from './components/TradingViewWidget';

const getCellColor = (value: number | null): string => {
  if (value != null) {
    if (value > 5) return '#008000'; // 진한 초록색 (5% 이상)
    if (value > 0) return '#32CD32'; // 연한 초록색 (0% 이상)
    if (value < -5) return '#FF0000'; // 진한 빨간색 (-5% 이하)
    if (value < 0) return '#FF6347'; // 연한 빨간색 (0% 이하)
  }
  return '#000000'; // 기본 검정색
};

const SP500MonthlyTable: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [returnsData, setReturnsData] = useState<Record<string, number[]>>(monthlyReturnsData); // JSON 데이터로 초기화
  const [updatedCell, setUpdatedCell] = useState<{ year: string; month: number } | null>(null);
  const [darkMode, setDarkMode] = useState(false); // 다크 모드 상태 추가

  const now = new Date();
  const currentYear = now.getFullYear().toString();
  const currentMonth = now.getMonth();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode); // 다크 모드 토글
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light', // 다크 모드와 라이트 모드 설정
    },
  });

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

  useEffect(() => {
    const fetchGrowthRate = async () => {
      try {
        const response = await fetch('/api/proxy');
        const data = await response.json();

        if (response.ok) {
          setReturnsData((prevData) => {
            const updatedData = { ...prevData };
            if (!updatedData[currentYear]) {
              updatedData[currentYear] = new Array(12).fill(null);
            }
            updatedData[currentYear][currentMonth] = data.growthRate;
            setUpdatedCell({ year: currentYear, month: currentMonth });

            return updatedData;
          });

          setTimeout(() => setUpdatedCell(null), 1000);
        } else {
          console.error('API 오류:', data.error);
        }
      } catch (error) {
        console.error('API 호출 실패:', error);
      }
    };

    fetchGrowthRate();
    const interval = setInterval(fetchGrowthRate, 5000);

    return () => clearInterval(interval);
  }, [currentYear, currentMonth]);

  const years = Object.keys(returnsData).sort((a, b) => Number(b) - Number(a));

  const monthlyAverages = months.map((_, i) => {
    const values = years.map(y => returnsData[y][i]).filter(v => v != null);
    const sum = values.reduce((a, b) => a + b, 0);
    return values.length ? sum / values.length : null;
  });

  return (
    <ThemeProvider theme={theme}>
      <Helmet>
        <title>S&P500 Monthly Returns</title>
        <meta name="description" content="Track S&P500 monthly returns and real-time updates." />
        <meta name="keywords" content="S&P500, stock market, monthly returns, real-time data" />
        <meta name="author" content="StockTable" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>
      <CssBaseline /> {/* 전역 스타일 적용 */}
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <Select
            value={i18n.language}
            onChange={(e) => changeLanguage(e.target.value)}
            style={{ minWidth: '120px' }}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="ko">한국어</MenuItem>
            <MenuItem value="ja">日本語</MenuItem>
          </Select>
          <FormControlLabel
            control={<Switch checked={darkMode} onChange={toggleDarkMode} />}
            label={darkMode ? t('darkMode') : t('lightMode')}
          />
        </div>

        <Typography variant="h4" gutterBottom>
          {t('realTimeChart')}
        </Typography>

        <TradingViewWidget /> {/* 다크 모드 상태 전달 */}

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
                    const fontColor = getCellColor(value); // 폰트 색상 계산
                    return (
                      <TableCell
                        key={y + i}
                        align="center"
                        className={isUpdated ? 'updated-cell' : ''}
                        style={{ color: fontColor }} // 폰트 색상 적용
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
                {monthlyAverages.map((value, i) => {
                  const fontColor = getCellColor(value);
                  return (
                    <TableCell key={"avg" + i} align="center" style={{ color: fontColor }}>
                      {value != null ? `${value.toFixed(2)}%` : '-'}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </ThemeProvider>
  );
};

export default SP500MonthlyTable;