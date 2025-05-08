import React, { useEffect, useRef } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';

interface TradingViewWidgetProps {
  darkMode: boolean;
  ticker: string;
  shouldUpdate?: boolean;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ darkMode, ticker, shouldUpdate }) => {
  const container = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (container.current) {
      container.current.innerHTML = '';
    }
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: ticker,
      interval: 'D',
      timezone: 'Asia/Seoul',
      theme: darkMode ? 'dark' : 'light',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      allow_symbol_change: true,
      support_host: 'https://www.tradingview.com'
    });
    if (container.current) {
      container.current.appendChild(script);
    }
  }, [ticker, darkMode, shouldUpdate]);

  return (
    <div className="tradingview-widget-container" style={{ height: isMobile ? '250px' : '500px' }}>
      <div ref={container} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default TradingViewWidget; 