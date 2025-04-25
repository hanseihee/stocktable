// /api/websocket.js
import yahooFinance from 'yahoo-finance2';

export default async function handler(req, res) {
  const { symbol } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: 'Missing "symbol" query parameter' });
  }

  try {
    // 실시간 가격 데이터 가져오기
    const quote = await yahooFinance.quote(symbol);
    
    // 응답 반환
    res.status(200).json({
      symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      previousClose: quote.regularMarketPreviousClose,
      open: quote.regularMarketOpen,
      dayHigh: quote.regularMarketDayHigh,
      dayLow: quote.regularMarketDayLow,
      volume: quote.regularMarketVolume,
      marketCap: quote.marketCap,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error fetching real-time data for ${symbol}:`, error);
    res.status(500).json({ error: 'Failed to fetch real-time data', detail: error.message });
  }
} 