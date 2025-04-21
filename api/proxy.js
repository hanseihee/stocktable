// import fetch from 'node-fetch'; // node-fetch를 사용하여 API 요청

// export default async function handler(req, res) {
//   try {
//     // Yahoo Finance Chart API URL (2개월 데이터 요청)
//     const url = 'https://query1.finance.yahoo.com/v8/finance/chart/^GSPC?range=2mo&interval=1d';

//     // API 요청
//     const response = await fetch(url);
//     const data = await response.json();

//     // S&P 500 데이터 추출
//     const result = data?.chart?.result?.[0];
//     const closePrices = result?.indicators?.quote?.[0]?.close;
//     const timestamps = result?.timestamp;

//     if (!closePrices || !timestamps || closePrices.length < 2) {
//       return res.status(404).json({ error: 'S&P 500 가격 데이터를 가져올 수 없습니다.' });
//     }

//     // 저번 달 말 종가 추출
//     const dates = timestamps.map((ts) => new Date(ts * 1000)); // 타임스탬프를 날짜로 변환
//     const lastMonthEndIndex = dates.findIndex((date) => date.getDate() === 1) - 1; // 저번 달 마지막 날의 인덱스

//     if (lastMonthEndIndex < 0 || !closePrices[lastMonthEndIndex]) {
//       return res.status(404).json({ error: '저번 달 말 종가를 가져올 수 없습니다.' });
//     }

//     const lastMonthEndPrice = closePrices[lastMonthEndIndex]; // 저번 달 말 종가
//     const latestPrice = closePrices[closePrices.length - 1]; // 현재 가격

//     if (!lastMonthEndPrice || !latestPrice) {
//       return res.status(404).json({ error: '가격 데이터를 가져올 수 없습니다.' });
//     }

//     // 상승률 계산
//     const growthRate = ((latestPrice - lastMonthEndPrice) / lastMonthEndPrice) * 100;

//     // 응답 반환
//     res.status(200).json({
//       latestPrice,
//       lastMonthEndPrice,
//       growthRate,
//       symbol: result?.meta?.symbol,
//     });
//   } catch (error) {
//     console.error('Yahoo Finance API 호출 에러:', error);
//     res.status(500).json({ error: 'S&P 500 가격 정보를 가져오는 데 실패했습니다.' });
//   }
// }