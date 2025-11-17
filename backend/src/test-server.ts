import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 简单的测试端点
app.get('/api/test', (req, res) => {
  res.json({ message: '服务器正常运行', timestamp: new Date().toISOString() });
});

app.get('/api/upload', (req, res) => {
  res.json({ message: '上传端点存在', method: 'POST required' });
});

app.post('/api/upload', (req, res) => {
  res.json({ message: 'POST上传端点存在', received: req.body });
});

app.listen(PORT, () => {
  console.log(`测试服务器运行在 http://localhost:${PORT}`);
});