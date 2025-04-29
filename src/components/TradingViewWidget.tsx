import React, { useEffect, useRef, useState } from 'react';
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
  const widgetRef = useRef<any>(null);
  const prevTickerRef = useRef<string>(ticker);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 위젯 초기화 함수
  const initWidget = () => {
    if (container.current && 'TradingView' in window) {
      // 기존 위젯이 있으면 제거
      if (widgetRef.current) {
        try {
          // 위젯 요소가 DOM에 존재하는지 확인
          const widgetElement = document.getElementById('tradingview_widget');
          if (widgetElement && widgetElement.parentNode) {
            widgetRef.current.remove();
          }
        } catch (error) {
          console.warn('Error removing TradingView widget:', error);
        }
      }
      
      // 새 위젯 생성
      try {
        widgetRef.current = new (window as any).TradingView.widget({
          autosize: true,
          symbol: ticker,
          interval: 'D',
          timezone: 'Asia/Seoul',
          theme: darkMode ? 'dark' : 'light',
          style: '1',
          locale: 'kr',
          toolbar_bg: darkMode ? '#1e222d' : '#f1f3f6',
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: container.current.id,
          height: isMobile ? 250 : 500,
        });
        
        // 현재 ticker 저장
        prevTickerRef.current = ticker;
      } catch (error) {
        console.error('Error creating TradingView widget:', error);
      }
    }
  }; 

  // 스크립트 로드 및 위젯 초기화
  useEffect(() => {
    // 이미 스크립트가 로드되어 있는지 확인
    if (document.querySelector('script[src="https://s3.tradingview.com/tv.js"]')) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
      initWidget();
    };
    document.head.appendChild(script);

    return () => {
      // 컴포넌트 언마운트 시 위젯 제거
      if (widgetRef.current) {
        try {
          // 위젯 요소가 DOM에 존재하는지 확인
          const widgetElement = document.getElementById('tradingview_widget');
          if (widgetElement && widgetElement.parentNode) {
            widgetRef.current.remove();
          }
        } catch (error) {
          console.warn('Error removing TradingView widget during cleanup:', error);
        }
      }
    };
  }, []);

  // 스크립트가 로드되면 위젯 초기화
  useEffect(() => {
    if (isScriptLoaded && container.current) {
      initWidget();
    }
  }, [isScriptLoaded]);

  // 다크모드가 변경될 때 위젯 재생성
  useEffect(() => {
    if (isScriptLoaded && container.current) {
      initWidget();
    }
  }, [darkMode, isMobile, isScriptLoaded]);

  // shouldUpdate가 true이고 ticker가 변경되었을 때만 위젯 재생성
  useEffect(() => {
    if (isScriptLoaded && shouldUpdate && ticker !== prevTickerRef.current && container.current) {
      initWidget();
    }
  }, [shouldUpdate, ticker, isScriptLoaded]);

  return (
    <div className="tradingview-widget-container" style={{ height: isMobile ? '250px' : '500px' }}>
      <div id="tradingview_widget" ref={container} style={{ height: '100%' }} />
    </div>
  );
};

export default TradingViewWidget; 