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

    // 현재 월의 등락률 계산
    const currentYear = now.getFullYear().toString();
    const currentMonth = now.getMonth();
    
    // 현재 월의 데이터가 있는 경우
    if (dailyResult && dailyResult.length > 1) {
      // 1일 기준으로 오늘의 등락률 계산
      const firstDayOpen = dailyResult[0].open;
      const lastDayClose = dailyResult[dailyResult.length - 1].close;
      const returnRate = ((lastDayClose - firstDayOpen) / firstDayOpen) * 100;
      
      // 현재 월의 등락률 설정
      if (!monthlyData[currentYear]) {
        monthlyData[currentYear] = new Array(12).fill(null);
      }
      monthlyData[currentYear][currentMonth] = parseFloat(returnRate.toFixed(2));
    }

    // PER, PBR 등 재무지표 가져오기
    const summary = await yahooFinance.quoteSummary(symbol, {
      modules: ['summaryDetail', 'defaultKeyStatistics', 'financialData']
    });

    // 실제 구조를 로그로 확인
    console.log('quoteSummary:', JSON.stringify(summary, null, 2));

    // PER, PBR 추출 (실제 구조에 맞게 경로 조정)
    const per =
      summary?.summaryDetail?.trailingPE ??
      summary?.defaultKeyStatistics?.trailingPE ??
      null;
    const pbr =
      summary?.defaultKeyStatistics?.priceToBook ??
      summary?.summaryDetail?.priceToBook ??
      null;

    // 응답 반환
    res.status(200).json({ 
      symbol, 
      data: monthlyData,
      dailyData: dailyResult, // 현재 월의 일별 데이터 포함
      per,
      pbr,
      message: '데이터를 localStorage에 저장하려면 브라우저 콘솔에서 다음 코드를 실행하세요: localStorage.setItem(\'stockData\', JSON.stringify(response.data))'
    });
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    res.status(500).json({ error: 'Failed to fetch data', detail: error.message });
  }
}
