import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface RealTimePriceProps { 
  symbol: string;
  className?: string;
}

interface PriceData {
  price: number;
  change: number;
  changePercent: number;
}

// 색상 관련 상수 (App.tsx에서 복사)
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

// getCellColor 함수 (App.tsx에서 복사)
const getCellColor = (value: number | null): string => {
  if (value != null) {
    if (value > 5) return COLORS.DARK_GREEN;
    if (value > 0) return COLORS.LIGHT_GREEN;
    if (value < -5) return COLORS.DARK_RED;
    if (value < 0) return COLORS.LIGHT_RED;
  }
  return COLORS.DEFAULT;
};

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
  const { t } = useTranslation();

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
        <PriceLabel isDarkMode={isDarkMode}>{t('realTimePrice.currentPrice')}</PriceLabel>
        <PriceValue isDarkMode={isDarkMode} style={{ color: getCellColor(priceData.change) }}>
          ${priceData.price.toFixed(2)}
        </PriceValue>
      </PriceRow>
      <PriceRow>
        <PriceLabel isDarkMode={isDarkMode}>{t('realTimePrice.change')}</PriceLabel>
        <PriceValue isPositive={priceData.change >= 0} isDarkMode={isDarkMode}>
          {priceData.change >= 0 ? '+' : ''}{priceData.change.toFixed(2)} ({priceData.changePercent.toFixed(2)}%)
        </PriceValue>
      </PriceRow>
    </PriceContainer>
  );
};

export default RealTimePrice; 