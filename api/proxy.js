import fetch from 'node-fetch'; // node-fetch를 사용하여 API 요청

export default async function handler(req, res) {
  try {
    // Yahoo Finance API URL
    const url = 'https://query1.finance.yahoo.com/v7/finance/quote?symbols=^GSPC';

    // API 요청
    const response = await fetch(url);
    const data = await response.json();

    // S&P 500 현재 가격 추출
    const quote = data?.quoteResponse?.result?.[0];
    const latestPrice = quote?.regularMarketPrice;

    if (!latestPrice) {
      return res.status(404).json({ error: 'S&P 500 가격 정보를 가져올 수 없습니다.' });
    }

    // 응답 반환
    res.status(200).json({
      latestPrice,
      symbol: quote?.symbol,
      timestamp: quote?.regularMarketTime,
    });
  } catch (error) {
    console.error('Yahoo Finance API 호출 에러:', error);
    res.status(500).json({ error: 'S&P 500 가격 정보를 가져오는 데 실패했습니다.' });
  }
}