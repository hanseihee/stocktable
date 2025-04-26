import type { NextApiRequest, NextApiResponse } from 'next';
import yahooFinance from 'yahoo-finance2';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { symbol } = req.query;

  if (!symbol || typeof symbol !== 'string') {
    return res.status(400).json({ error: 'Symbol is required' });
  }

  try {
    // Fetch historical data from Yahoo Finance
    const result = await yahooFinance.historical(symbol, {
      period1: '2008-01-01',
      interval: '1d',
    });

    // Calculate drawdown
    let peak = result[0].close;
    const drawdown = result.map(quote => {
      const date = quote.date;
      const close = quote.close;
      
      // Update peak if we have a new high
      if (close > peak) {
        peak = close;
      }
      
      // Calculate drawdown percentage
      const drawdownPercent = ((close - peak) / peak) * 100;
      
      return {
        date: date.toISOString(),
        drawdown: drawdownPercent
      };
    });

    res.status(200).json({ drawdown });
  } catch (error) {
    console.error('Error fetching drawdown data:', error);
    res.status(500).json({ error: 'Failed to fetch drawdown data' });
  }
} 