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
  CssBaseline,
  Button,
  TextField,
  Box
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

// 테이블 데이터 타입 정의
interface TableData {
  [year: string]: (number | null)[];
}

const SP500MonthlyTable: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [returnsData, setReturnsData] = useState<Record<string, number[]>>(monthlyReturnsData);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState('SPY');
  const [shouldUpdateWidget, setShouldUpdateWidget] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
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

  // 데이터 가져오기 함수
  const fetchStockData = async (symbol: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/stock?symbol=${symbol}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || '데이터를 가져오는데 실패했습니다.');
      }

      // localStorage에 데이터 저장
      localStorage.setItem('stockData', JSON.stringify(result.data));
      
      // 테이블 데이터 설정 - 기존 테이블 데이터 업데이트
      setReturnsData(result.data);
      setSelectedSymbol(symbol);
      
      // 위젯 업데이트 플래그 설정
      setShouldUpdateWidget(true);
      
      console.log('데이터를 성공적으로 가져왔습니다:', result.data);
    } catch (error) {
      console.error('데이터 가져오기 실패:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 페이지 로드 시 SPY 데이터 가져오기
  useEffect(() => {
    fetchStockData('SPY');
  }, []);

  // 심볼 입력 필드 변경 핸들러
  const handleSymbolChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedSymbol(event.target.value);
  };

  // 데이터 가져오기 버튼 클릭 핸들러
  const handleFetchData = () => {
    fetchStockData(selectedSymbol);
  };

  // 위젯 업데이트 후 플래그 초기화
  useEffect(() => {
    if (shouldUpdateWidget) {
      const timer = setTimeout(() => {
        setShouldUpdateWidget(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [shouldUpdateWidget]);

  const years = Object.keys(returnsData).sort((a, b) => Number(b) - Number(a));

  const monthlyAverages = months.map((_, i) => {
    const values = years.map(y => returnsData[y][i]).filter(v => v != null);
    const sum = values.reduce((a, b) => a + b, 0);
    return values.length ? sum / values.length : null;
  });

  // 연도별 합계 계산
  const yearlySums = years.reduce((acc, year) => {
    const values = returnsData[year].filter(v => v != null);
    const sum = values.reduce((a, b) => a + b, 0);
    acc[year] = values.length ? sum : null;
    return acc;
  }, {} as Record<string, number | null>);

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
          <div style={{ display: 'flex', gap: '10px' }}>
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
          <FormControlLabel
            control={<Switch checked={darkMode} onChange={toggleDarkMode} />}
            label={darkMode ? t('darkMode') : t('lightMode')}
          />
        </div>

        {/* 주식 심볼 입력 폼 */}
        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleFetchData(); }} sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <TextField
            label="주식 심볼"
            variant="outlined"
            value={selectedSymbol}
            onChange={handleSymbolChange}
            placeholder="예: AAPL, MSFT, ^GSPC"
            sx={{ flexGrow: 1 }}
          />
          <Button type="submit" variant="contained" disabled={isLoading}>
            데이터 가져오기
          </Button>
        </Box>

        {isLoading ? (
          <div className="loading">데이터를 불러오는 중...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : null}

        <Typography variant="h4" gutterBottom>
          {t('realTimeChart')}
        </Typography>

        {/* @ts-ignore */}
        <TradingViewWidget darkMode={darkMode} ticker={selectedSymbol} shouldUpdate={shouldUpdateWidget} />

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
                <TableCell align="center">연간 합계</TableCell>
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
                    const fontColor = getCellColor(value);
                    return (
                      <TableCell
                        key={y + i}
                        align="center"
                        style={{ color: fontColor }}
                      >
                        {value != null ? `${value.toFixed(2)}%` : '-'}
                      </TableCell>
                    );
                  })}
                  <TableCell align="center" style={{ color: getCellColor(yearlySums[y]) }}>
                    {yearlySums[y] != null ? `${yearlySums[y]?.toFixed(2)}%` : '-'}
                  </TableCell>
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
                <TableCell align="center">
                  <strong>
                    {monthlyAverages.filter(v => v != null).length > 0
                      ? `${((monthlyAverages.filter(v => v != null) as number[]).reduce((a, b) => a + b, 0)).toFixed(2)}%`
                      : '-'}
                  </strong>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </ThemeProvider>
  );
};

export default SP500MonthlyTable;