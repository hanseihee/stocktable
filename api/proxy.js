import fetch from 'node-fetch'; // node-fetch를 사용하여 API 요청

export default async function handler(req, res) {
  try {
    // Yahoo Finance Chart API URL
    const url = 'https://query1.finance.yahoo.com/v8/finance/chart/^GSPC?range=1d&interval=1m';

    // API 요청
    const response = await fetch(url);
    const data = await response.json();

    // S&P 500 현재 가격 추출
    const result = data?.chart?.result?.[0];
    const closePrices = result?.indicators?.quote?.[0]?.close;
    const latestPrice = closePrices?.filter((price) => price != null).pop(); // 마지막 유효한 가격

    if (!latestPrice) {
      return res.status(404).json({ error: 'S&P 500 가격 정보를 가져올 수 없습니다.' });
    }

    // 응답 반환
    res.status(200).json({
      latestPrice,
      symbol: result?.meta?.symbol,
      timestamp: result?.timestamp?.pop(), // 마지막 타임스탬프
    });
  } catch (error) {
    console.error('Yahoo Finance API 호출 에러:', error);
    res.status(500).json({ error: 'S&P 500 가격 정보를 가져오는 데 실패했습니다.' });
  }
}