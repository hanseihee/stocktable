/**
 * App.tsx
 * 
 * Tickipop 애플리케이션의 메인 컴포넌트
 * 주식 데이터 표시, 다국어 지원, 다크모드 등의 기능을 포함
 */

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
import monthlyReturnsData from './data/monthlyReturn.json'; // 월별 수익률 데이터
import './App.css';
import TradingViewWidget from './components/TradingViewWidget';
import { Routes, Route, Navigate, useParams, useNavigate, Link } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react"
import RealTimePrice from './components/RealTimePrice';
import DrawdownChart from './components/DrawdownChart';
import { changeLanguage as changeI18nLanguage } from './i18n';

// 색상 관련 상수
const COLORS = {
  DARK_GREEN: '#32CD32', // 진한 초록색 (5% 이상)
  LIGHT_GREEN: '#008000', // 연한 초록색 (0% 이상)
  DARK_RED: '#FF0000', // 진한 빨간색 (-5% 이하)
  LIGHT_RED: '#FF6347', // 연한 빨간색 (0% 이하)
  DEFAULT: '#000000', // 기본 검정색
  DARK_BG: '#1a1a1a', // 다크모드 배경색
  LIGHT_BG: '#f5f5f5', // 라이트모드 배경색
  DARK_HEADER: '#2c3e50', // 다크모드 헤더색
  LIGHT_HEADER: '#455d73', // 라이트모드 헤더색
  DARK_INPUT: '#333', // 다크모드 입력 필드 색상
  LIGHT_INPUT: '#f5f5f5', // 라이트모드 입력 필드 색상
  DARK_HOVER: '#404040', // 다크모드 호버 색상
  LIGHT_HOVER: '#e8e8e8', // 라이트모드 호버 색상
};

/**
 * 셀 색상 결정 함수
 * 수익률 값에 따라 다른 색상을 반환
 * @param value 수익률 값
 * @returns 색상 코드
 */
const getCellColor = (value: number | null): string => {
  if (value != null) {
    if (value > 5) return COLORS.DARK_GREEN;
    if (value > 0) return COLORS.LIGHT_GREEN;
    if (value < -5) return COLORS.DARK_RED;
    if (value < 0) return COLORS.LIGHT_RED;
  }
  return COLORS.DEFAULT;
};

// 테이블 데이터 타입 정의
interface TableData {
  [year: string]: (number | null)[]; 
}

/**
 * 검색 옵션 타입 정의
 */
type SearchOption = string | { 
  symbol: string; 
  longname: string; 
  logoUrl?: string;
  exchange?: string;
  sector?: string;
};

// 검색 관련 상수
const SEARCH_HISTORY_MAX_ITEMS = 10;
const SEARCH_DEBOUNCE_DELAY = 300;

/**
 * 메타 설명 생성 함수
 * SEO를 위한 메타 설명 텍스트 생성
 * @param symbol 주식 심볼
 * @returns 메타 설명 텍스트
 */
const generateMetaDescription = (symbol: string) => {
  return `Track ${symbol} stock performance with real-time data, monthly returns analysis, and maximum drawdown metrics. Get comprehensive insights and historical performance data for ${symbol}.`;
};

/**
 * 메타 키워드 생성 함수
 * SEO를 위한 메타 키워드 텍스트 생성
 * @param symbol 주식 심볼
 * @returns 메타 키워드 텍스트
 */
const generateMetaKeywords = (symbol: string) => {
  return `${symbol} stock, ${symbol} analysis, ${symbol} performance, monthly returns, maximum drawdown, stock market, financial charts, market analysis, real-time stock data, technical analysis`;
};

/**
 * 메타 태그 생성 함수
 * SEO를 위한 메타 태그 객체 생성
 * @param symbol 주식 심볼
 * @param title 페이지 제목
 * @returns 메타 태그 객체
 */
const generateMetaTags = (symbol: string | null, title: string) => {
  const baseUrl = 'https://tickipop.com';
  const url = symbol ? `${baseUrl}/symbol/${symbol}` : baseUrl;
  const description = symbol ? generateMetaDescription(symbol) : 'Track stock performance with monthly returns, maximum drawdown analysis, and real-time market data. Get comprehensive stock market insights and historical performance metrics.';
  const keywords = symbol ? generateMetaKeywords(symbol) : 'stock analysis, monthly returns, maximum drawdown, stock market, financial charts, market analysis, stock performance, investment tools, real-time stock data, technical analysis';
  
  return {
    title,
    description,
    keywords,
    ogTitle: title,
    ogDescription: description,
    ogUrl: url,
    twitterTitle: title,
    twitterDescription: description,
    canonicalUrl: url
  };
};

// Tickipop 컴포넌트 props 타입 정의
interface TickipopProps {
  defaultSymbol?: string; // 기본 심볼 (루트 경로에서 사용)
}

/**
 * Tickipop 메인 컴포넌트
 * 주식 데이터 표시 및 사용자 인터페이스 제공
 */
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

  // 사용할 심볼 결정 (URL 파라미터, 기본 심볼, localStorage 순으로 확인)
  const currentSymbol = routeSymbol || defaultSymbol || localStorage.getItem('lastSymbol') || '';

  // 검색 기록 로드
  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      try {
        const parsedHistory = JSON.parse(history);
        // 이전 형식(문자열 배열)에서 새 형식으로 변환
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

  /**
   * 검색 기록 저장 함수
   * @param symbol 저장할 심볼
   */
  const saveSearchHistory = (symbol: string) => {
    const upperSymbol = symbol.toUpperCase();
    const newHistory = [
      { symbol: upperSymbol, longname: upperSymbol },
      ...searchHistory.filter(item => 
        typeof item === 'string' ? item !== upperSymbol : item.symbol !== upperSymbol
      )
    ].slice(0, SEARCH_HISTORY_MAX_ITEMS); // 최대 10개까지만 저장
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  /**
   * 언어 변경 함수
   * @param lng 변경할 언어 코드
   */
  const changeLanguage = (lng: string) => {
    changeI18nLanguage(lng);
  };

  /**
   * 다크모드 토글 함수
   */
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  // 테마 설정
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
    typography: {
      fontFamily: '"Noto Sans", sans-serif',
    },
  });

  // 월 이름 배열 (현재 언어에 맞게)
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

  /**
   * 주식 데이터 가져오기 함수
   * @param symbolToFetch 가져올 주식 심볼
   */
  const fetchStockData = async (symbolToFetch: string) => {
    if (!symbolToFetch) return; // 심볼이 없으면 가져오지 않음
    
    try {
      setIsLoading(true);
      setError(null);
      
      // API 호출
      const response = await fetch(`/api/stock?symbol=${symbolToFetch}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || t('errors.fetchFailed'));
      }

      // localStorage에 데이터 저장
      localStorage.setItem('stockData', JSON.stringify(result.data));
      localStorage.setItem('lastSymbol', symbolToFetch);
      
      // 테이블 데이터 설정
      setReturnsData(result.data);
      setMonthlyReturns(result.data);
      setDisplaySymbol(symbolToFetch);
      
      // 검색 기록 저장
      saveSearchHistory(symbolToFetch);
      
      // 위젯 업데이트 플래그 설정
      setShouldUpdateWidget(true);
      
    } catch (error) {
      console.error(t('errors.fetchError'), error);
      setError(error instanceof Error ? error.message : t('errors.unknownError'));
    } finally {
      setIsLoading(false);
    }
  };

  // 페이지 로드 또는 심볼 변경 시 데이터 가져오기
  useEffect(() => {
    const upperSymbol = currentSymbol.toUpperCase();
    if (upperSymbol) {
      fetchStockData(upperSymbol);
      // 검색 입력 필드 초기화
      setSelectedSymbol('');
      // 기본 심볼을 사용하지 않는 경우에만 URL 변경
      if (!routeSymbol && currentSymbol && !defaultSymbol) {
        navigate(`/symbol/${upperSymbol}`, { replace: true });
      }
    }
  }, [currentSymbol, navigate, routeSymbol, defaultSymbol]);

  /**
   * 심볼 입력 필드 변경 핸들러
   */
  const handleSymbolChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedSymbol(event.target.value);
  };

  /**
   * 데이터 가져오기 버튼 클릭 핸들러
   */
  const handleFetchData = () => {
    const upperSymbol = selectedSymbol.toUpperCase();
    if (upperSymbol && upperSymbol !== displaySymbol) { // 심볼이 유효하고 변경된 경우에만 가져오기
      navigate(`/symbol/${upperSymbol}`);
      setSelectedSymbol(''); // 검색 후 입력 필드 초기화
    }
  };

  /**
   * 검색 기록에서 항목 선택 핸들러
   */
  const handleHistorySelect = (_event: React.SyntheticEvent, value: SearchOption | null) => {
    if (value) {
      const symbol = typeof value === 'string' ? value : value.symbol;
      setSelectedSymbol(symbol);
      navigate(`/symbol/${symbol.toUpperCase()}`);
      setSelectedSymbol(''); // 선택 후 입력 필드 초기화
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

  // 연도 목록 (내림차순 정렬)
  const years = Object.keys(returnsData).sort((a, b) => Number(b) - Number(a));

  // 월별 평균 계산
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

  /**
   * 검색 제안 가져오기 함수 (디바운스 적용)
   */
  const debouncedFetchSuggestions = useCallback(
    async (query: string) => {
      if (!query) {
        setSuggestions([]);
        return;
      }
      
      try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        
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
        console.error(t('errors.suggestionsError'), error);
        setSuggestions([]);
      }
    },
    [t]
  );

  // 검색어 변경 시 디바운스 적용하여 제안 가져오기
  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedFetchSuggestions(searchQuery);
    }, SEARCH_DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedFetchSuggestions]);

  /**
   * 검색 바 렌더링 함수
   */
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
            setSelectedSymbol(''); // 드롭다운에서 선택 후 입력 필드 초기화
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
            placeholder={t('search.placeholder')}
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
            backgroundColor: theme.palette.mode === 'dark' ? COLORS.DARK_INPUT : COLORS.LIGHT_INPUT,
            borderRadius: '50px',
            paddingRight: '80px', // 검색 버튼 공간 확보
            height: '40px',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? COLORS.DARK_HOVER : COLORS.LIGHT_HOVER
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
          backgroundColor: theme.palette.mode === 'dark' ? COLORS.DARK_HEADER : COLORS.LIGHT_HEADER,
          color: '#fff',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? COLORS.LIGHT_HEADER : COLORS.DARK_HEADER,
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
      {/* SEO 및 메타 태그 설정 */}
      <Helmet>
        {(() => {
          const metaTags = generateMetaTags(
            displaySymbol, 
            displaySymbol ? `${displaySymbol} Stock Analysis - Tickipop` : 'Tickipop - Stock Analysis & Performance Tracking'
          );
          
          return (
            <>
              <title>{metaTags.title}</title>
              <meta name="description" content={metaTags.description} />
              <meta name="keywords" content={metaTags.keywords} />
              
              {/* OpenGraph 태그 */}
              <meta property="og:title" content={metaTags.ogTitle} />
              <meta property="og:description" content={metaTags.ogDescription} />
              <meta property="og:type" content="website" />
              <meta property="og:url" content={metaTags.ogUrl} />
              
              {/* Twitter 카드 태그 */}
              <meta name="twitter:title" content={metaTags.twitterTitle} />
              <meta name="twitter:description" content={metaTags.twitterDescription} />
              
              {/* 정규 URL */}
              <link rel="canonical" href={metaTags.canonicalUrl} />
              
              {/* 추가 메타 태그 */}
              <meta name="robots" content="index, follow" />
              <meta name="author" content="Tickipop" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </>
          );
        })()}
      </Helmet>
      <CssBaseline /> {/* 전역 스타일 적용 */}
      
      {/* 앱 바 (헤더) */}
      <AppBar position="static" sx={{ 
        backgroundColor: theme.palette.mode === 'dark' ? COLORS.DARK_BG : COLORS.DARK_HEADER,
        boxShadow: 'none',
        borderBottom: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? '#333' : COLORS.LIGHT_HEADER
      }}>
        <Toolbar sx={{ 
          minHeight: '56px',
          gap: 2,
          padding: '0 16px'
        }}>
          {/* 로고 */}
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

          {/* 데스크톱에서 검색 바 표시 */}
          {!isMobile && renderSearchBar()}

          {/* 언어 선택 및 다크모드 토글 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginLeft: 'auto' }}>
            <Select
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
              size="small"
              sx={{
                backgroundColor: theme.palette.mode === 'dark' ? COLORS.DARK_INPUT : COLORS.LIGHT_INPUT,
                '& fieldset': { border: 'none' },
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? COLORS.DARK_HOVER : COLORS.LIGHT_HOVER
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
                backgroundColor: theme.palette.mode === 'dark' ? COLORS.DARK_INPUT : 'transparent',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? COLORS.DARK_HOVER : 'rgba(255,255,255,0.1)'
                }
              }}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* 모바일에서 검색 바 표시 */}
      {isMobile && renderSearchBar()}

      {/* 메인 콘텐츠 */}
      <div style={{ padding: '20px' }}>
        {/* 로딩 및 에러 상태 표시 */}
        {isLoading ? (
          <div className="loading">{t('loading.data')}</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : null}

        {/* 심볼이 선택된 경우 데이터 표시 */}
        {displaySymbol && (
          <>
            {/* 실시간 차트 섹션 */}
            <Typography variant="h4" gutterBottom>
              {displaySymbol} {t('realTimeChart')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <Box sx={{ flex: 1, width: { md: '85%' } }}>
                {/* TradingView 위젯 */}
                <TradingViewWidget darkMode={darkMode} ticker={displaySymbol} shouldUpdate={shouldUpdateWidget} />
              </Box>
              <Box sx={{ width: { xs: '100%', md: '400px' } }}>
                {/* 실시간 가격 정보 */}
                <RealTimePrice symbol={displaySymbol} />
                <Box sx={{ mt: 2 }}>
                  {/* 최대 낙폭 차트 */}
                  <DrawdownChart symbol={displaySymbol} monthlyReturns={monthlyReturns} />
                </Box>
              </Box>
            </Box>

            {/* 월별 수익률 테이블 섹션 */}
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
                {/* 테이블 헤더 */}
                <TableHead>
                  <TableRow>
                    <TableCell 
                      sx={{ 
                        position: 'sticky', 
                        left: 0, 
                        zIndex: 1,
                        backgroundColor: theme.palette.mode === 'dark' ? '#424242' : COLORS.LIGHT_INPUT,
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
                      {t('table.yearlyTotal')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                {/* 테이블 본문 */}
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
                          backgroundColor: theme.palette.mode === 'dark' ? '#424242' : COLORS.LIGHT_INPUT,
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
                  {/* 평균 행 */}
                  <TableRow>
                    <TableCell
                      sx={{ 
                        position: 'sticky', 
                        left: 0, 
                        zIndex: 1,
                        backgroundColor: theme.palette.mode === 'dark' ? '#424242' : COLORS.LIGHT_INPUT,
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

      {/* 푸터 */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: theme.palette.mode === 'dark' ? COLORS.DARK_BG : COLORS.LIGHT_INPUT,
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
                {t('footer.copyright', { year: new Date().getFullYear() })}
              </Typography>
            </Box>
            <Box sx={{ 
              width: { xs: '100%', sm: '50%' },
              display: 'flex',
              justifyContent: { xs: 'center', sm: 'flex-end' },
              gap: 2
            }}>
              <Link to="/privacy" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="body2" color="text.secondary">{t('footer.privacy')}</Typography>
              </Link>
              <Link to="/terms" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="body2" color="text.secondary">{t('footer.terms')}</Typography>
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

/**
 * App 컴포넌트
 * 라우팅 설정 및 메인 컴포넌트 렌더링
 */
const App: React.FC = () => {
  // 라우트 설정
  const routes = [
    { path: "/", element: <Tickipop defaultSymbol="SPY" /> },
    { path: "/symbol/:symbol", element: <Tickipop /> },
    { path: "*", element: <Navigate to="/" replace /> }
  ];

  return (
    <>
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
      <Analytics />
    </>
  );
};

export default App;