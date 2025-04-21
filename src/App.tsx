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
import TableComponent from './components/TableComponent';

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
  const [returnsData, setReturnsData] = useState<Record<string, number[]>>(monthlyReturnsData); // JSON 데이터로 초기화
  const [updatedCell, setUpdatedCell] = useState<{ year: string; month: number } | null>(null);
  const [darkMode, setDarkMode] = useState(false); // 다크 모드 상태 추가
  const [tableData, setTableData] = useState<TableData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState('^GSPC'); // 기본값으로 S&P 500 설정

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
          // API 응답 데이터를 localStorage에 저장
          localStorage.setItem('sp500Data', JSON.stringify(data));
          
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

    // 페이지 로드 시 localStorage에서 데이터 불러오기
    const loadSavedData = () => {
      const savedData = localStorage.getItem('sp500Data');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          console.log('저장된 데이터 불러오기:', parsedData);
        } catch (e) {
          console.error('저장된 데이터 파싱 오류:', e);
        }
      }
    };

    loadSavedData();
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

  const handleRefresh = () => {
    fetchStockData(selectedSymbol);
  };

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
      
      // 테이블 데이터 설정
      setTableData(result.data);
      setSelectedSymbol(symbol);
      
      console.log('데이터를 성공적으로 가져왔습니다:', result.data);
    } catch (error) {
      console.error('데이터 가져오기 실패:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 페이지 로드 시 S&P 500 데이터 가져오기
  useEffect(() => {
    fetchStockData('^GSPC');
  }, []);

  // 심볼 입력 필드 변경 핸들러
  const handleSymbolChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedSymbol(event.target.value);
  };

  // 데이터 가져오기 버튼 클릭 핸들러
  const handleFetchData = () => {
    fetchStockData(selectedSymbol);
  };

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
            <Button
              variant="contained"
              onClick={handleRefresh}
            >
              {t('refresh')}
            </Button>
          </div>
          <FormControlLabel
            control={<Switch checked={darkMode} onChange={toggleDarkMode} />}
            label={darkMode ? t('darkMode') : t('lightMode')}
          />
        </div>

        {/* 주식 심볼 입력 폼 */}
        <Box component="form" onSubmit={handleFetchData} sx={{ mb: 3, display: 'flex', gap: 2 }}>
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

        {/* 주식 데이터 표시 */}
        {isLoading ? (
          <div className="loading">데이터를 불러오는 중...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <TableComponent data={tableData} />
        )}

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