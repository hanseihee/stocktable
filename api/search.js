// /api/search.js
export default async function handler(req, res) {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Missing "query" parameter' });
  }

  try {
    const response = await fetch(
      `https://query2.finance.yahoo.com/v1/finance/search?q=${query}&lang=en-US&region=US&quotesCount=5&newsCount=0&listsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query&multiQuoteQueryId=multi_quote_single_token_query&newsQueryId=news_cie_vespa&enableCb=false&enableNavLinks=true&enableEnhancedTrivialQuery=true&enableResearchReports=false&enableCulturalAssets=true&enableLogoUrl=true&enableLists=false&recommendCount=0&enablePrivateCompany=true`
    );

    if (!response.ok) {
      throw new Error(`Yahoo Finance API responded with status: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({ error: 'Failed to fetch search suggestions' });
  }
} 