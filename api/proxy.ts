import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('API 호출됨: /api/proxy');
    const response = await fetch('https://query1.finance.yahoo.com/v7/finance/quote?symbols=^GSPC');
    const data = await response.json();

    const quote = data?.quoteResponse?.result?.[0];

    const latestPrice = quote?.regularMarketPrice;
    const monthStartPrice = quote?.regularMarketOpen; // 또는 추정 값
    const growthRate = latestPrice && monthStartPrice
      ? ((latestPrice - monthStartPrice) / monthStartPrice) * 100
      : null;

    res.status(200).json({
      latestPrice,
      monthStartPrice,
      growthRate
    });
  } catch (error) {
    console.error('API 호출 에러:', error);
    res.status(500).json({ error: '가격 정보를 가져오는 데 실패했습니다.' });
  }
}
