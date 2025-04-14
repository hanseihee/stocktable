export default function handler(req, res) {
  res.json({
    queries: req.query,
    cookies: req.cookies,
    body: req.body,
    test: 'Hello, world!'
  })
}