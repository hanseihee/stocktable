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
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Helmet } from 'react-helmet';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
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
  const { symbol: routeSymbol } = useParams<{ symbol?: string }>(); // Make symbol optional
  const navigate = useNavigate();
  const themeMui = useTheme(); // Renamed to avoid conflict with local theme variable
  const isMobile = useMediaQuery(themeMui.breakpoints.down('sm'));

  // Determine the symbol to use
  const currentSymbol = routeSymbol || localStorage.getItem('lastSymbol') || 'SPY';

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
  const fetchStockData = async (symbolToFetch: string) => {
    if (!symbolToFetch) return; // Avoid fetching if symbol is empty
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/stock?symbol=${symbolToFetch}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || '데이터를 가져오는데 실패했습니다.');
      }

      // localStorage에 데이터 저장
      localStorage.setItem('stockData', JSON.stringify(result.data));
      localStorage.setItem('lastSymbol', symbolToFetch);
      
      // 테이블 데이터 설정
      setReturnsData(result.data);
      // setSelectedSymbol(symbolToFetch); // Keep input separate from display/fetch
      setDisplaySymbol(symbolToFetch);
      
      // 검색 기록 저장
      saveSearchHistory(symbolToFetch);
      
      // 위젯 업데이트 플래그 설정
      setShouldUpdateWidget(true);
      
    } catch (error) {
      console.error('데이터 가져오기 실패:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 페이지 로드 또는 심볼 변경 시 데이터 가져오기
  useEffect(() => {
    const upperSymbol = currentSymbol.toUpperCase();
    fetchStockData(upperSymbol);
    // Update search input only if it differs from the fetched symbol
    if (selectedSymbol.toUpperCase() !== upperSymbol) {
       setSelectedSymbol(upperSymbol);
    }
    // Navigate to the specific symbol URL if we landed on root
    if (!routeSymbol && currentSymbol) {
      navigate(`/symbol/${upperSymbol}`, { replace: true });
    }
  }, [currentSymbol, navigate, routeSymbol]); // Depend on currentSymbol

  // 심볼 입력 필드 변경 핸들러
  const handleSymbolChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedSymbol(event.target.value);
  };

  // 데이터 가져오기 버튼 클릭 핸들러
  const handleFetchData = () => {
    const upperSymbol = selectedSymbol.toUpperCase();
    if (upperSymbol && upperSymbol !== displaySymbol) { // Fetch only if symbol is valid and changed
      navigate(`/symbol/${upperSymbol}`);
    }
  };

  // 검색 기록에서 항목 선택 핸들러
  const handleHistorySelect = (event: React.SyntheticEvent, value: string | null) => {
    if (value) {
      setSelectedSymbol(value); // Update input field
      navigate(`/symbol/${value.toUpperCase()}`);
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

  const renderSearchBar = () => (
    <Box component="form" 
      onSubmit={(e) => { e.preventDefault(); handleFetchData(); }} 
      sx={{ 
        display: 'flex',
        flexGrow: { xs: 0, sm: 1 }, // Allow growth on larger screens
        maxWidth: { xs: '100%', sm: '680px' },
        gap: 1,
        padding: { xs: '16px', sm: 0 }, // Add padding on mobile
        order: { xs: 1, sm: 0 } // Change order on mobile
      }}
    >
      <Autocomplete
        freeSolo
        options={searchHistory}
        value={selectedSymbol}
        onChange={handleHistorySelect}
        onInputChange={(event, newInputValue) => {
          setSelectedSymbol(newInputValue);
        }}
        sx={{
          flexGrow: 1,
          '& .MuiInputBase-root': {
            backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#f5f5f5',
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? '#404040' : '#e8e8e8'
            },
            '& fieldset': {
              border: 'none'
            }
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search for news, symbols or companies"
            variant="outlined"
            size="small"
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <SearchIcon sx={{ color: 'text.secondary', ml: 1, mr: 1 }} />
              )
            }}
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
      <Button 
        type="submit" 
        variant="contained"
        disabled={isLoading}
        sx={{ 
          minWidth: 'auto',
          px: 3,
          backgroundColor: '#00a400',
          '&:hover': {
            backgroundColor: '#008f00'
          }
        }}
      >
        <SearchIcon />
      </Button>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <Helmet>
        <title>{displaySymbol || currentSymbol} {t('monthlyReturns')}</title>
        <meta name="description" content={`Track ${displaySymbol || currentSymbol} ${t('monthlyReturns')} and real-time updates.`} />
        <meta name="keywords" content={`${displaySymbol || currentSymbol}, stock market, ${t('monthlyReturns')}, real-time data`} />
        <meta name="author" content="StockTable" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>
      <CssBaseline /> {/* 전역 스타일 적용 */}
      <AppBar position="static" sx={{ 
        backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#1976d2',
        boxShadow: 'none',
        borderBottom: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? '#333' : '#e5e5e5'
      }}>
        <Toolbar sx={{ 
          minHeight: '56px',
          gap: 2,
          padding: '0 16px'
        }}>
          <Typography 
            variant="h6" 
            component={Link} 
            to="/"
            sx={{ 
              textDecoration: 'none', 
              color: 'white',
              fontWeight: 'bold',
              '&:hover': {
                textDecoration: 'none',
                opacity: 0.8
              }
            }}
          >
            StockTable
          </Typography>

          {!isMobile && renderSearchBar()} {/* Render search bar in Toolbar on non-mobile */} 

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginLeft: 'auto' }}> {/* Ensure right alignment */} 
            <Select
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
              size="small"
              sx={{
                backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#f5f5f5',
                '& fieldset': { border: 'none' },
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? '#404040' : '#e8e8e8'
                }
              }}
            >
              <MenuItem value="en">🇺🇸 EN</MenuItem>
              <MenuItem value="ko">🇰🇷 KO</MenuItem>
              <MenuItem value="ja">🇯🇵 JA</MenuItem>
            </Select>
            <IconButton 
              onClick={toggleDarkMode} 
              sx={{ 
                color: 'white',
                backgroundColor: theme.palette.mode === 'dark' ? '#333' : 'transparent',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? '#404040' : 'rgba(255,255,255,0.1)'
                }
              }}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      {isMobile && renderSearchBar()} {/* Render search bar below AppBar on mobile */} 

      <div style={{ padding: '20px' }}>
        {isLoading ? (
          <div className="loading">데이터를 불러오는 중...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : null}

        {displaySymbol && (
          <>
            <Typography variant="h4" gutterBottom>
              {displaySymbol} {t('realTimeChart')}
            </Typography>
            {/* @ts-ignore */}
            <TradingViewWidget darkMode={darkMode} ticker={displaySymbol} shouldUpdate={shouldUpdateWidget} />

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              {displaySymbol} {t('monthlyReturns')}
            </Typography>
            <TableContainer 
              component={Paper} 
              sx={{ 
                overflowX: 'auto',
                position: 'relative',
                '& .MuiTable-root': {
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                }
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell 
                      sx={{ 
                        position: 'sticky', 
                        left: 0, 
                        zIndex: 1,
                        backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#f5f5f5',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        minWidth: '80px',
                        width: '80px',
                        whiteSpace: 'nowrap',
                        padding: '12px 8px'
                      }}
                    >
                      {t('year')}
                    </TableCell>
                    {months.map((month, i) => (
                      <TableCell 
                        key={i} 
                        align="center"
                        sx={{
                          minWidth: '80px',
                          whiteSpace: 'nowrap',
                          padding: '12px 8px'
                        }}
                      >
                        {month}
                      </TableCell>
                    ))}
                    <TableCell 
                      align="center"
                      sx={{
                        minWidth: '100px',
                        whiteSpace: 'nowrap',
                        padding: '12px 8px'
                      }}
                    >
                      연간 합계
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {years.map(y => (
                    <TableRow key={y}>
                      <TableCell 
                        component="th" 
                        scope="row"
                        sx={{ 
                          position: 'sticky', 
                          left: 0, 
                          zIndex: 1,
                          backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#f5f5f5',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          minWidth: '80px',
                          width: '80px',
                          whiteSpace: 'nowrap',
                          padding: '12px 8px'
                        }}
                      >
                        {y}
                      </TableCell>
                      {months.map((_, i) => {
                        const value = returnsData[y][i];
                        const fontColor = getCellColor(value);
                        return (
                          <TableCell
                            key={y + i}
                            align="center"
                            sx={{
                              minWidth: '80px',
                              whiteSpace: 'nowrap',
                              padding: '12px 8px'
                            }}
                            style={{ color: fontColor }}
                          >
                            {value != null ? `${value.toFixed(2)}%` : '-'}
                          </TableCell>
                        );
                      })}
                      <TableCell 
                        align="center" 
                        sx={{
                          minWidth: '100px',
                          whiteSpace: 'nowrap',
                          padding: '12px 8px'
                        }}
                        style={{ color: getCellColor(yearlySums[y]) }}
                      >
                        {yearlySums[y] != null ? `${yearlySums[y]?.toFixed(2)}%` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell
                      sx={{ 
                        position: 'sticky', 
                        left: 0, 
                        zIndex: 1,
                        backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#f5f5f5',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        minWidth: '80px',
                        width: '80px',
                        whiteSpace: 'nowrap',
                        padding: '12px 8px'
                      }}
                    >
                      {t('average')}
                    </TableCell>
                    {monthlyAverages.slice(0, -1).map((value, i) => {
                      const fontColor = getCellColor(value);
                      return (
                        <TableCell 
                          key={"avg" + i} 
                          align="center"
                          sx={{
                            minWidth: '80px',
                            whiteSpace: 'nowrap',
                            padding: '12px 8px'
                          }}
                          style={{ color: fontColor }}
                        >
                          {value != null ? `${value.toFixed(2)}%` : '-'}
                        </TableCell>
                      );
                    })}
                    <TableCell 
                      align="center"
                      sx={{
                        minWidth: '100px',
                        whiteSpace: 'nowrap',
                        padding: '12px 8px'
                      }}
                    >
                      <strong>-</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </div>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<StockTable />} />
      <Route path="/symbol/:symbol" element={<StockTable />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;