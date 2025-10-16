// middleware/logger.js
module.exports = function logRequests(req, res, next) {
  console.log(`\n📥 [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log(`🔸 Request Body:`, req.body);
  console.log(`🔸 Query Params:`, req.query);
  console.log(`🔸 URL Params:`, req.params);

  const originalSend = res.send;
  res.send = function (body) {
    console.log(`📤 Response:`, body);
    originalSend.call(this, body);
  };

  next();
};
