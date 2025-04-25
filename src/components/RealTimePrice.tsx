import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

interface RealTimePriceProps {
  symbol: string;
  className?: string;
}

interface PriceData {
  price: number;
  change: number;
  changePercent: number;
}

const PriceContainer = styled.div`
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const PriceLabel = styled.span`
  font-weight: 600;
  color: #495057;
`;

const PriceValue = styled.span<{ isPositive?: boolean }>`
  font-weight: 700;
  color: ${props => props.isPositive ? '#28a745' : '#dc3545'};
`;

const RealTimePrice: React.FC<RealTimePriceProps> = ({ symbol, className }) => {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRealTimePrice = async () => {
      try {
        const response = await fetch(`/api/websocket?symbol=${symbol}`);
        if (!response.ok) {
          throw new Error('Failed to fetch real-time price');
        }
        const data = await response.json();
        setPriceData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    // 초기 데이터 로드
    fetchRealTimePrice();

    // 5초마다 데이터 업데이트
    const interval = setInterval(fetchRealTimePrice, 5000);

    return () => clearInterval(interval);
  }, [symbol]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!priceData) {
    return <div>Loading...</div>;
  }

  return (
    <PriceContainer>
      <PriceRow>
        <PriceLabel>Current Price</PriceLabel>
        <PriceValue>${priceData.price.toFixed(2)}</PriceValue>
      </PriceRow>
      <PriceRow>
        <PriceLabel>Change</PriceLabel>
        <PriceValue isPositive={priceData.change >= 0}>
          {priceData.change >= 0 ? '+' : ''}{priceData.change.toFixed(2)} ({priceData.changePercent.toFixed(2)}%)
        </PriceValue>
      </PriceRow>
    </PriceContainer>
  );
};

export default RealTimePrice; 