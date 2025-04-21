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

    // monthlyReturn.json과 동일한 형태로 데이터 변환
    const monthlyData = {};
    
    // 날짜별로 데이터 그룹화
    for (let i = 0; i < result.length; i++) {
      const item = result[i];
      const year = item.date.getFullYear().toString();
      const month = item.date.getMonth(); // 0-11
      
      // 해당 연도가 없으면 초기화
      if (!monthlyData[year]) {
        monthlyData[year] = new Array(12).fill(null);
      }
      
      // 월별 등락률 계산 (퍼센트)
      if (i > 0) {
        const prevItem = result[i - 1];
        const prevMonth = prevItem.date.getMonth();
        const prevYear = prevItem.date.getFullYear().toString();
        
        // 같은 연도의 이전 월인 경우에만 계산
        if (prevYear === year || (prevYear === (parseInt(year) - 1).toString() && month === 0 && prevMonth === 11)) {
          const returnRate = ((item.close - prevItem.close) / prevItem.close) * 100;
          monthlyData[year][month] = parseFloat(returnRate.toFixed(2));
        }
      }
    }

    // 응답 반환
    res.status(200).json({ 
      symbol, 
      data: monthlyData,
      message: '데이터를 localStorage에 저장하려면 브라우저 콘솔에서 다음 코드를 실행하세요: localStorage.setItem(\'stockData\', JSON.stringify(response.data))'
    });
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    res.status(500).json({ error: 'Failed to fetch data', detail: error.message });
  }
}
