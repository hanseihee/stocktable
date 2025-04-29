import React, { useEffect, useRef } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';

interface TradingViewWidgetProps {
  darkMode?: boolean;
  ticker?: string;
  shouldUpdate?: boolean;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ 
  darkMode = false, 
  ticker = 'SPY',
  shouldUpdate = false
}) => {
  const container = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const prevTickerRef = useRef<string>(ticker);

  useEffect(() => {
    // 이전 ticker와 현재 ticker가 다르거나 shouldUpdate가 true일 때만 위젯 업데이트
    if (shouldUpdate || ticker !== prevTickerRef.current) {
      // 이전 ticker 업데이트
      prevTickerRef.current = ticker;
      
      // 기존 위젯 컨테이너 내용 제거
      if (container.current) {
        container.current.innerHTML = '';
      }
      
      // 새 위젯 스크립트 생성
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.innerHTML = JSON.stringify({
        "autosize": true,
        "symbol": ticker,
        "interval": "D",
        "timezone": "Asia/Seoul",
        "theme": darkMode ? "dark" : "light",
        "style": "1",
        "locale": "kr",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "support_host": "https://www.tradingview.com"
      });
      
      // 스크립트를 컨테이너에 추가
      if (container.current) {
        container.current.appendChild(script);
      }
    }
  }, [ticker, darkMode, shouldUpdate]);

  return (
    <div className="tradingview-widget-container" style={{ height: isMobile ? '250px' : '500px' }}>
      <div 
        className="tradingview-widget-container__widget" 
        style={{ height: '100%', width: '100%' }}
        ref={container}
      />
    </div>
  );
};

export default TradingViewWidget; 