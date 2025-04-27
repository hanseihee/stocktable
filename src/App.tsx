import React, { useEffect, useState, useCallback } from 'react';
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
  useMediaQuery,
  Container,
  Grid,
  GridProps
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
import { Analytics } from "@vercel/analytics/react"
import RealTimePrice from './components/RealTimePrice';
import DrawdownChart from './components/DrawdownChart';

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

type SearchOption = string | { 
  symbol: string; 
  longname: string; 
  logoUrl?: string;
  exchange?: string;
  sector?: string;
};

// Add this near the top of the file, outside of any component
const generateMetaDescription = (symbol: string) => {
  return `Track ${symbol} stock performance with real-time data, monthly returns analysis, and maximum drawdown metrics. Get comprehensive insights and historical performance data for ${symbol}.`;
};

const generateMetaKeywords = (symbol: string) => {
  return `${symbol} stock, ${symbol} analysis, ${symbol} performance, monthly returns, maximum drawdown, stock market, financial charts, market analysis, real-time stock data, technical analysis`;
};

interface TickipopProps {
  defaultSymbol?: string;
}

const Tickipop: React.FC<TickipopProps> = ({ defaultSymbol }) => {
  const { t, i18n } = useTranslation();
  const [returnsData, setReturnsData] = useState<Record<string, number[]>>(monthlyReturnsData);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [shouldUpdateWidget, setShouldUpdateWidget] = useState(false);
  const [displaySymbol, setDisplaySymbol] = useState('');
  const [searchHistory, setSearchHistory] = useState<SearchOption[]>([]);
  const [suggestions, setSuggestions] = useState<SearchOption[]>([]);
  const { symbol: routeSymbol } = useParams<{ symbol?: string }>();
  const navigate = useNavigate();
  const themeMui = useTheme();
  const isMobile = useMediaQuery(themeMui.breakpoints.down('sm'));
  const [searchQuery, setSearchQuery] = useState('');
  const [monthlyReturns, setMonthlyReturns] = useState<Record<string, number[]>>({});

  // Determine the symbol to use
  const currentSymbol = routeSymbol || defaultSymbol || localStorage.getItem('lastSymbol') || '';

  // 검색 기록 로드
  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      try {
        const parsedHistory = JSON.parse(history);
        // Convert old format (string[]) to new format if needed
        const formattedHistory = parsedHistory.map((item: string | SearchOption) => {
          if (typeof item === 'string') {
            return { symbol: item, longname: item };
          }
          return item;
        });
        setSearchHistory(formattedHistory);
      } catch (error) {
        console.error('Failed to parse search history:', error);
        setSearchHistory([]);
      }
    }
  }, []);

  // 검색 기록 저장
  const saveSearchHistory = (symbol: string) => {
    const upperSymbol = symbol.toUpperCase();
    const newHistory = [
      { symbol: upperSymbol, longname: upperSymbol },
      ...searchHistory.filter(item => 
        typeof item === 'string' ? item !== upperSymbol : item.symbol !== upperSymbol
      )
    ].slice(0, 10);
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
    typography: {
      fontFamily: '"Noto Sans", sans-serif',
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
      setMonthlyReturns(result.data);
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
    if (upperSymbol) {
      fetchStockData(upperSymbol);
      // Clear the search input when loading a symbol from URL or localStorage
      setSelectedSymbol('');
      // Only navigate if we're not using the defaultSymbol
      if (!routeSymbol && currentSymbol && !defaultSymbol) {
        navigate(`/symbol/${upperSymbol}`, { replace: true });
      }
    }
  }, [currentSymbol, navigate, routeSymbol, defaultSymbol]); // Add defaultSymbol to dependencies

  // 심볼 입력 필드 변경 핸들러
  const handleSymbolChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedSymbol(event.target.value);
  };

  // 데이터 가져오기 버튼 클릭 핸들러
  const handleFetchData = () => {
    const upperSymbol = selectedSymbol.toUpperCase();
    if (upperSymbol && upperSymbol !== displaySymbol) { // Fetch only if symbol is valid and changed
      navigate(`/symbol/${upperSymbol}`);
      setSelectedSymbol(''); // Clear the search input after search
    }
  };

  // 검색 기록에서 항목 선택 핸들러
  const handleHistorySelect = (_event: React.SyntheticEvent, value: SearchOption | null) => {
    if (value) {
      const symbol = typeof value === 'string' ? value : value.symbol;
      setSelectedSymbol(symbol);
      navigate(`/symbol/${symbol.toUpperCase()}`);
      setSelectedSymbol(''); // Clear the search input after selecting from history
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

  // Add debounced fetch function
  const debouncedFetchSuggestions = useCallback(
    async (query: string) => {
      if (!query) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        console.log('API Response:', data); // Debug log
        if (data.quotes) {
          setSuggestions(data.quotes.map((quote: any) => ({
            symbol: quote.symbol,
            longname: quote.longname || quote.shortname,
            logoUrl: quote.logoUrl,
            exchange: quote.exchDisp,
            sector: quote.sectorDisp
          })));
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        setSuggestions([]);
      }
    },
    []
  );

  // Add debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedFetchSuggestions(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedFetchSuggestions]);

  const renderSearchBar = () => (
    <Box component="form" 
      onSubmit={(e) => { e.preventDefault(); handleFetchData(); }} 
      sx={{ 
        display: 'flex',
        flexGrow: { xs: 0, sm: 1 },
        maxWidth: { xs: '100%', sm: '680px' },
        gap: 1,
        padding: { xs: '16px', sm: 0 },
        order: { xs: 1, sm: 0 },
        position: 'relative'
      }}
    >
      <Autocomplete
        freeSolo
        options={[...suggestions, ...searchHistory]}
        value={selectedSymbol}
        onChange={(event, newValue) => {
          if (newValue) {
            const symbol = typeof newValue === 'string' ? newValue : newValue.symbol;
            setSelectedSymbol(symbol);
            navigate(`/symbol/${symbol.toUpperCase()}`);
            setSelectedSymbol(''); // Clear the search input after selecting from dropdown
          }
        }}
        onInputChange={(event, newInputValue) => {
          setSelectedSymbol(newInputValue);
          setSearchQuery(newInputValue);
        }}
        getOptionLabel={(option) => {
          if (typeof option === 'string') return option;
          return `${option.symbol} - ${option.longname}`;
        }}
        renderOption={(props, option) => {
          if (typeof option === 'string') {
            return (
              <li {...props}>
                <HistoryIcon fontSize="small" style={{ marginRight: 8 }} />
                <ListItemText primary={option} />
              </li>
            );
          }
          return (
            <li {...props}>
              {option.logoUrl ? (
                <img 
                  src={option.logoUrl} 
                  alt={option.symbol}
                  style={{ 
                    width: 20, 
                    height: 20, 
                    marginRight: 8,
                    objectFit: 'contain'
                  }} 
                />
              ) : (
                <SearchIcon fontSize="small" style={{ marginRight: 8 }} />
              )}
              <ListItemText 
                primary={`${option.symbol} - ${option.longname}`}
                secondary={option.exchange ? `${option.exchange}${option.sector ? ` • ${option.sector}` : ''}` : undefined}
              />
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="stocks, symbols or companies"
            variant="outlined"
            size="small"
            InputProps={{
              ...params.InputProps,
              style: { height: '40px' }
            }}
          />
        )}
        sx={{
          flexGrow: 1,
          '& .MuiInputBase-root': {
            backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#f5f5f5',
            borderRadius: '50px',
            paddingRight: '80px', // Make room for the wider search button
            height: '40px',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? '#404040' : '#e8e8e8'
            },
            '& fieldset': {
              border: 'none'
            }
          }
        }}
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
          width: '72px',
          height: '40px',
          padding: 0,
          borderRadius: '50px',
          position: 'absolute',
          right: '0',
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: theme.palette.mode === 'dark' ? '#2c3e50' : '#455d73',
          color: '#fff',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? '#455d73' : '#2c3e50',
            boxShadow: 'none'
          },
          '&:disabled': {
            backgroundColor: '#ccc'
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
        <title>
          {displaySymbol ? `${displaySymbol} Stock Analysis - Tickipop` : 'Tickipop - Stock Analysis & Performance Tracking'}
        </title>
        <meta name="description" content={displaySymbol ? generateMetaDescription(displaySymbol) : 'Track stock performance with monthly returns, maximum drawdown analysis, and real-time market data. Get comprehensive stock market insights and historical performance metrics.'} />
        <meta name="keywords" content={displaySymbol ? generateMetaKeywords(displaySymbol) : 'stock analysis, monthly returns, maximum drawdown, stock market, financial charts, market analysis, stock performance, investment tools, real-time stock data, technical analysis'} />
        
        {/* OpenGraph tags */}
        <meta property="og:title" content={displaySymbol ? `${displaySymbol} Stock Analysis - Tickipop` : 'Tickipop - Stock Analysis & Performance Tracking'} />
        <meta property="og:description" content={displaySymbol ? generateMetaDescription(displaySymbol) : 'Track stock performance with monthly returns, maximum drawdown analysis, and real-time market data.'} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://tickipop.com${displaySymbol ? `/symbol/${displaySymbol}` : ''}`} />
        
        {/* Twitter Card tags */}
        <meta name="twitter:title" content={displaySymbol ? `${displaySymbol} Stock Analysis - Tickipop` : 'Tickipop - Stock Analysis & Performance Tracking'} />
        <meta name="twitter:description" content={displaySymbol ? generateMetaDescription(displaySymbol) : 'Track stock performance with monthly returns, maximum drawdown analysis, and real-time market data.'} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`https://tickipop.com${displaySymbol ? `/symbol/${displaySymbol}` : ''}`} />
        
        {/* Additional meta tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Tickipop" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>
      <CssBaseline /> {/* 전역 스타일 적용 */}
      <AppBar position="static" sx={{ 
        backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#2c3e50',
        boxShadow: 'none',
        borderBottom: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? '#333' : '#455d73'
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
            TICKIPOP
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
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <Box sx={{ flex: 1, width: { md: '85%' } }}>
                {/* @ts-ignore */}
                <TradingViewWidget darkMode={darkMode} ticker={displaySymbol} shouldUpdate={shouldUpdateWidget} />
              </Box>
              <Box sx={{ width: { xs: '100%', md: '400px' } }}>
                <RealTimePrice symbol={displaySymbol} />
                <Box sx={{ mt: 2 }}>
                  <DrawdownChart symbol={displaySymbol} monthlyReturns={monthlyReturns} />
                </Box>
              </Box>
            </Box>

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
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
          borderTop: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? '#333' : '#e5e5e5'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 3
          }}>
            <Box sx={{ 
              width: { xs: '100%', sm: '50%' },
              textAlign: { xs: 'center', sm: 'left' }
            }}>
              <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} Tickipop.com. All rights reserved.
              </Typography>
            </Box>
            <Box sx={{ 
              width: { xs: '100%', sm: '50%' },
              display: 'flex',
              justifyContent: { xs: 'center', sm: 'flex-end' },
              gap: 2
            }}>
              <Link to="/privacy" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="body2" color="text.secondary">Privacy Policy</Typography>
              </Link>
              <Link to="/terms" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="body2" color="text.secondary">Terms of Service</Typography>
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Tickipop defaultSymbol="SPY" />} />
        <Route path="/symbol/:symbol" element={<Tickipop />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Analytics />
    </>
  );
};

export default App;