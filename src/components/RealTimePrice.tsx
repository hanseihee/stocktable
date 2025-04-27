import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '@mui/material';

interface RealTimePriceProps { 
  symbol: string;
  className?: string;
}

interface PriceData {
  price: number;
  change: number;
  changePercent: number;
}

const PriceContainer = styled.div<{ isDarkMode: boolean }>`
  background-color: ${props => props.isDarkMode ? '#333' : '#f8f9fa'};
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

const PriceLabel = styled.span<{ isDarkMode: boolean }>`
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#e0e0e0' : '#495057'};
`;

const PriceValue = styled.span<{ isPositive?: boolean; isDarkMode: boolean }>`
  font-weight: 700;
  color: ${props => {
    if (props.isDarkMode) {
      return props.isPositive ? '#4caf50' : '#f44336';
    }
    return props.isPositive ? '#28a745' : '#dc3545';
  }};
`;

const RealTimePrice: React.FC<RealTimePriceProps> = ({ symbol, className }) => {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

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
    <PriceContainer isDarkMode={isDarkMode}>
      <PriceRow>
        <PriceLabel isDarkMode={isDarkMode}>Current Price</PriceLabel>
        <PriceValue isDarkMode={isDarkMode}>${priceData.price.toFixed(2)}</PriceValue>
      </PriceRow>
      <PriceRow>
        <PriceLabel isDarkMode={isDarkMode}>Change</PriceLabel>
        <PriceValue isPositive={priceData.change >= 0} isDarkMode={isDarkMode}>
          {priceData.change >= 0 ? '+' : ''}{priceData.change.toFixed(2)} ({priceData.changePercent.toFixed(2)}%)
        </PriceValue>
      </PriceRow>
    </PriceContainer>
  );
};

export default RealTimePrice; 