// 共用錯誤處理包裝，統一 catch 錯誤並回傳 500
function asyncHandler(fn) {
  return (req, res) => fn(req, res).catch(err => {
    console.error(`${req.method} ${req.originalUrl} error:`, err);
    res.status(500).json({ error: '伺服器錯誤' });
  });
}

module.exports = asyncHandler;
