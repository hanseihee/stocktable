// /api/stock.js
import yahooFinance from 'yahoo-finance2';

export default async function handler(req, res) {
  const symbol = req.query.symbol;

  if (!symbol) {
    return res.status(400).json({ error: 'Missing "symbol" query parameter' });
  }

  try {
    const result = await yahooFinance.historical(symbol, {
      period1: '2000-01-01',
      interval: '1mo'
    });

    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'No data found for symbol: ' + symbol });
    }

    const formatted = result.map(item => ({
      date: item.date.toISOString().slice(0, 7),
      close: item.close
    }));

    res.status(200).json({ symbol, data: formatted });
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    res.status(500).json({ error: 'Failed to fetch data', detail: error.message });
  }
}
