import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const targetUrl = req.query.url as string;

  // 🔒 url 파라미터 누락 시 오류 반환
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing "url" query parameter.' });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',           // ✅ 헤더 추가 (Yahoo 일부 차단 방지용)
        'Accept': 'application/json'
      }
    });

    const contentType = response.headers.get('content-type') || '';

    // 🔍 응답이 JSON인지 확인
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return res.status(200).json(data); // ✅ 정상 반환
    } else {
      // ❌ HTML 같은 응답이면 오류 반환
      const text = await response.text();
      console.warn('⚠️ Received non-JSON response from target URL:', text.slice(0, 200));
      return res.status(500).json({
        error: 'Invalid response from Yahoo',
        preview: text.slice(0, 200) // 일부 HTML 내용 미리 보여줌
      });
    }
  } catch (error) {
    console.error('❌ Proxy fetch failed:', error);
    return res.status(500).json({ error: 'Failed to fetch from target URL', details: String(error) });
  }
}
