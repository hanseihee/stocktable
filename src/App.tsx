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
  CssBaseline,
  Button,
  TextField,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Autocomplete,
  ListItemText,
  Divider
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Helmet } from 'react-helmet';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import HistoryIcon from '@mui/icons-material/History';
import monthlyReturnsData from './data/monthlyReturn.json'; // JSON 파일 가져오기
import './App.css';
import TradingViewWidget from './components/TradingViewWidget';
import { Routes, Route, Navigate, useParams, useNavigate, Link } from 'react-router-dom';

const getCellColor = (value: number | null): string => {
  if (value != null) {
    if (value > 5) return '#32CD32'; // 진한 초록색 (5% 이상)
    if (value > 0) return '#008000'; // 연한 초록색 (0% 이상)
    if (value < -5) return '#FF0000'; // 진한 빨간색 (-5% 이하)
    if (value < 0) return '#FF6347'; // 연한 빨간색 (0% 이하)
  }
  return '#000000'; // 기본 검정색
};

// 테이블 데이터 타입 정의
interface TableData {
  [year: string]: (number | null)[];
}

const StockTable: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [returnsData, setReturnsData] = useState<Record<string, number[]>>(monthlyReturnsData);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [shouldUpdateWidget, setShouldUpdateWidget] = useState(false);
  const [displaySymbol, setDisplaySymbol] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const { symbol = 'SPY' } = useParams<{ symbol: string }>();
  const navigate = useNavigate();

  // 검색 기록 로드
  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // 검색 기록 저장
  const saveSearchHistory = (symbol: string) => {
    const upperSymbol = symbol.toUpperCase();
    const newHistory = [upperSymbol, ...searchHistory.filter(item => item !== upperSymbol)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

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
      localStorage.setItem('lastSymbol', symbol);
      
      // 테이블 데이터 설정 - 기존 테이블 데이터 업데이트
      setReturnsData(result.data);
      setSelectedSymbol(symbol);
      setDisplaySymbol(symbol);
      
      // 검색 기록 저장
      saveSearchHistory(symbol);
      
      // 위젯 업데이트 플래그 설정
      setShouldUpdateWidget(true);
      
    } catch (error) {
      console.error('데이터 가져오기 실패:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 페이지 로드 시 마지막으로 검색한 티커 데이터 가져오기
  useEffect(() => {
    fetchStockData(symbol.toUpperCase());
  }, [symbol]);

  // 심볼 입력 필드 변경 핸들러
  const handleSymbolChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedSymbol(event.target.value);
  };

  // 데이터 가져오기 버튼 클릭 핸들러
  const handleFetchData = () => {
    const upperSymbol = selectedSymbol.toUpperCase();
    navigate(`/symbol/${upperSymbol}`);
  };

  // 검색 기록에서 항목 선택 핸들러
  const handleHistorySelect = (event: React.SyntheticEvent, value: string | null) => {
    if (value) {
      navigate(`/symbol/${value}`);
    }
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
        <title>{displaySymbol} {t('monthlyReturns')}</title>
        <meta name="description" content={`Track ${displaySymbol} ${t('monthlyReturns')} and real-time updates.`} />
        <meta name="keywords" content={`${displaySymbol}, stock market, ${t('monthlyReturns')}, real-time data`} />
        <meta name="author" content="StockTable" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>
      <CssBaseline /> {/* 전역 스타일 적용 */}
      <AppBar position="static" style={{ background: '#1976d2' }}>
        <Toolbar>
          <Typography 
            variant="h6" 
            style={{ flexGrow: 1, cursor: 'pointer' }}
            component={Link} 
            to="/"
            sx={{ textDecoration: 'none', color: 'white' }}
          >
            StockTable
          </Typography>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Select
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
              style={{ minWidth: '120px' }}
            >
              <MenuItem value="en">🇺🇸 English</MenuItem>
              <MenuItem value="ko">🇰🇷 한국어</MenuItem>
              <MenuItem value="ja">🇯🇵 日本語</MenuItem>
            </Select>
            <IconButton onClick={toggleDarkMode} color="inherit">
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      <div style={{ padding: '20px' }}>
        {/* 주식 심볼 입력 폼 */}
        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleFetchData(); }} sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <Autocomplete
            freeSolo
            options={searchHistory}
            value={selectedSymbol}
            onChange={handleHistorySelect}
            onInputChange={(event, newInputValue) => {
              setSelectedSymbol(newInputValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="주식 심볼"
                variant="outlined"
                placeholder="예: AAPL, MSFT, ^GSPC"
                sx={{ flexGrow: 1 }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <HistoryIcon fontSize="small" style={{ marginRight: 8 }} />
                <ListItemText primary={option} />
              </li>
            )}
            ListboxProps={{
              style: { maxHeight: 300 }
            }}
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
          {displaySymbol} {t('realTimeChart')}
        </Typography>

        {/* @ts-ignore */}
        <TradingViewWidget darkMode={darkMode} ticker={displaySymbol} shouldUpdate={shouldUpdateWidget} />

        <Typography variant="h5" gutterBottom>
          {displaySymbol} {t('monthlyReturns')}
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
                {monthlyAverages.slice(0, -1).map((value, i) => {
                  const fontColor = getCellColor(value);
                  return (
                    <TableCell key={"avg" + i} align="center" style={{ color: fontColor }}>
                      {value != null ? `${value.toFixed(2)}%` : '-'}
                    </TableCell>
                  );
                })}
                <TableCell align="center">
                  <strong>-</strong>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/symbol/${localStorage.getItem('lastSymbol') || 'SPY'}`} replace />} />
      <Route path="/symbol/:symbol" element={<StockTable />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;