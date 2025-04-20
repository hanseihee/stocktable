// 파일: /api/stock.ts 또는 .js (type: module일 때도 사용 가능)
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

    const formatted = result.map(item => ({
      date: item.date.toISOString().slice(0, 7),
      close: item.close
    }));

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json({ symbol, data: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
