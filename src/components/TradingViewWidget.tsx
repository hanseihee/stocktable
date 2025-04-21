import React, { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  darkMode?: boolean;
  ticker?: string;
  shouldUpdate?: boolean;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ 
  darkMode = false, 
  ticker = 'SP:SPX',
  shouldUpdate = false
}) => {
  const container = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const prevTickerRef = useRef<string>(ticker);

  // 위젯 초기화 함수
  const initWidget = () => {
    if (container.current && 'TradingView' in window) {
      // 기존 위젯이 있으면 제거
      if (widgetRef.current) {
        widgetRef.current.remove();
      }
      
      // 새 위젯 생성
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
      });
      
      // 현재 ticker 저장
      prevTickerRef.current = ticker;
    }
  };

  // 스크립트 로드 및 위젯 초기화
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = initWidget;
    document.head.appendChild(script);

    return () => {
      script.remove();
      if (widgetRef.current) {
        widgetRef.current.remove();
      }
    };
  }, []);

  // 다크모드가 변경될 때 위젯 재생성
  useEffect(() => {
    initWidget();
  }, [darkMode]);

  // shouldUpdate가 true이고 ticker가 변경되었을 때만 위젯 재생성
  useEffect(() => {
    if (shouldUpdate && ticker !== prevTickerRef.current) {
      initWidget();
    }
  }, [shouldUpdate, ticker]);

  return (
    <div className="tradingview-widget-container" style={{ height: '500px' }}>
      <div id="tradingview_widget" ref={container} style={{ height: '100%' }} />
    </div>
  );
};

export default TradingViewWidget; 