/**
 * 주식 검색 API 핸들러
 * Yahoo Finance API를 사용하여 주식 심볼 검색 기능 제공
 */

// Yahoo Finance API URL 상수
const YAHOO_FINANCE_API_URL = 'https://query2.finance.yahoo.com/v1/finance/search';

/**
 * API 핸들러 함수
 * @param {Object} req - 요청 객체
 * @param {Object} res - 응답 객체
 */
export default async function handler(req, res) {
  const { query } = req.query;

  // 쿼리 파라미터 검증
  if (!query) {
    return res.status(400).json({ error: 'Missing "query" parameter' });
  }

  try {
    // Yahoo Finance API 호출
    const response = await fetch(
      `${YAHOO_FINANCE_API_URL}?q=${query}&lang=en-US&region=US&quotesCount=5&newsCount=0&listsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query&multiQuoteQueryId=multi_quote_single_token_query&newsQueryId=news_cie_vespa&enableCb=false&enableNavLinks=true&enableEnhancedTrivialQuery=true&enableResearchReports=false&enableCulturalAssets=true&enableLogoUrl=true&enableLists=false&recommendCount=0&enablePrivateCompany=true`
    );

    // API 응답 검증
    if (!response.ok) {
      throw new Error(`Yahoo Finance API responded with status: ${response.status}`);
    }

    // 응답 데이터 파싱 및 반환
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    // 오류 로깅 및 응답
    console.error('Search API error:', error);
    res.status(500).json({ error: 'Failed to fetch search suggestions' });
  }
} 