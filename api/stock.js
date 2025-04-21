// /api/stock.js
import yahooFinance from 'yahoo-finance2';

export default async function handler(req, res) {
  const symbol = req.query.symbol;

  if (!symbol) {
    return res.status(400).json({ error: 'Missing "symbol" query parameter' });
  }

  try {
    // 월별 데이터 가져오기
    const monthlyResult = await yahooFinance.historical(symbol, {
      period1: '1950-01-01',
      interval: '1mo'
    });

    if (!monthlyResult || monthlyResult.length === 0) {
      return res.status(404).json({ error: 'No data found for symbol: ' + symbol });
    }

    // 현재 월의 일별 데이터 가져오기
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const dailyResult = await yahooFinance.historical(symbol, {
      period1: firstDayOfMonth.toISOString().split('T')[0],
      interval: '1d'
    });
    console.log("===================일별 데이터 ===================")
    console.log(dailyResult)
    


    // monthlyReturn.json과 동일한 형태로 데이터 변환
    const monthlyData = {};
    
    // 날짜별로 데이터 그룹화
    for (let i = 0; i < monthlyResult.length; i++) {
      const item = monthlyResult[i];
      const year = item.date.getFullYear().toString();
      const month = item.date.getMonth(); // 0-11
      
      // 해당 연도가 없으면 초기화
      if (!monthlyData[year]) {
        monthlyData[year] = new Array(12).fill(null);
      }
      
      // 월별 등락률 계산 (퍼센트)
      if (i > 0) {
        const prevItem = monthlyResult[i - 1];
        const prevMonth = prevItem.date.getMonth();
        const prevYear = prevItem.date.getFullYear().toString();
        
        // 같은 연도의 이전 월인 경우에만 계산
        if (prevYear === year || (prevYear === (parseInt(year) - 1).toString() && month === 0 && prevMonth === 11)) {
          const returnRate = ((item.close - prevItem.close) / prevItem.close) * 100;
          monthlyData[year][month] = parseFloat(returnRate.toFixed(2));
        }
      }
    }

    // 현재 월의 등락률 합계 계산
    const currentYear = now.getFullYear().toString();
    const currentMonth = now.getMonth();
    
    console.log("===================일별 등락률 계산 및 합산===================")
    // 현재 월의 데이터가 있는 경우
    if (dailyResult && dailyResult.length > 1) {
      let totalReturnRate = 0;
      
      // 일별 등락률 계산 및 합산
      for (let i = 1; i < dailyResult.length; i++) {
        const todayPrice = dailyResult[i-1].close;
        const yesterdayPrice = dailyResult[i].close;
        const dailyReturnRate = ((todayPrice - yesterdayPrice) / yesterdayPrice) * 100;
        console.log( todayPrice, yesterdayPrice, dailyReturnRate);
        totalReturnRate += dailyReturnRate;
      }
      
      // 현재 월의 등락률 설정
      if (!monthlyData[currentYear]) {
        monthlyData[currentYear] = new Array(12).fill(null);
      }
      monthlyData[currentYear][currentMonth] = parseFloat(totalReturnRate.toFixed(2));
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
