import React from 'react';

const TradingViewWidget: React.FC = () => {
  return (
    <div style={{ height: '400px', width: '100%' }}>
      {/* TradingView 위젯 삽입 */}
      <iframe
        src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_12345"
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="TradingView Widget"
      ></iframe>
    </div>
  );
};

export default TradingViewWidget;