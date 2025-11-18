import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs-extra';
import dotenv from 'dotenv';
import { processAudio } from './services/audioProcessor.js';
import { extractKeywords, generateExerciseOptions } from './services/keywordExtractor.js';
import { registerUser, loginUser, verifyToken, getUserById } from './services/auth.js';
import vocabularyService from './services/vocabularyService.js';
import db from './database/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 修复静态文件服务配置
// 基础uploads目录静态服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// 音频文件专门路由 - 指向uploads/audio目录
app.use('/audio', express.static(path.join(__dirname, '../uploads/audio')));

// 可选认证中间件（如果没有token，使用匿名用户）
const optionalAuthenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = verifyToken(token);
        (req as any).user = decoded;
      } catch (error) {
        // token无效，使用匿名用户
        (req as any).user = { userId: 0, username: 'anonymous' };
      }
    } else {
      // 没有token，使用匿名用户
      (req as any).user = { userId: 0, username: 'anonymous' };
    }
    next();
  } catch (error: any) {
    // 出错也使用匿名用户
    (req as any).user = { userId: 0, username: 'anonymous' };
    next();
  }
};

// 确保上传目录存在
const uploadsDir = path.join(__dirname, '../uploads');
const audioDir = path.join(uploadsDir, 'audio');
const questionsDir = path.join(uploadsDir, 'questions');

fs.ensureDirSync(audioDir);
fs.ensureDirSync(questionsDir);

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      cb(null, audioDir);
    } else if (file.fieldname === 'questions') {
      cb(null, questionsDir);
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { 
    fileSize: 100 * 1024 * 1024, // 100MB限制
    files: 2 // 最多2个文件（音频+题目）
  },
  fileFilter: (req, file, cb) => {
    // 允许所有音频格式和文本文件
    if (file.fieldname === 'audio') {
      // 允许所有音频格式（包括m4a, mp3, wav等）
      cb(null, true);
    } else if (file.fieldname === 'questions') {
      // 允许文本文件
      const allowedMimes = ['text/plain', 'text/markdown', 'application/octet-stream'];
      if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(txt|md)$/i)) {
        cb(null, true);
      } else {
        cb(new Error('题目文件必须是 .txt 或 .md 格式'));
      }
    } else {
      cb(null, true);
    }
  }
});

// ========== 用户认证相关接口 ==========

// 用户注册
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: '请提供用户名、邮箱和密码' });
    }
    const user = await registerUser(username, email, password);
    // 注册后自动登录，生成token
    const loginResult = await loginUser(username, password);
    res.json({ message: '注册成功', user: loginResult.user, token: loginResult.token });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 用户登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: '请提供用户名和密码' });
    }
    const result = await loginUser(username, password);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

// 获取当前用户信息
app.get('/api/auth/me', optionalAuthenticate, (req, res) => {
  try {
    const user = getUserById((req as any).user.userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========== 文件上传和会话管理 ==========

// Multer错误处理中间件
const handleMulterError = (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: '文件大小超过限制（最大100MB）' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: '文件数量超过限制' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: '不支持的文件字段' });
    }
    return res.status(400).json({ error: `文件上传错误: ${err.message}` });
  }
  if (err) {
    return res.status(500).json({ error: `上传失败: ${err.message}` });
  }
  next();
};

// 上传文件接口
app.post('/api/upload', optionalAuthenticate, (req, res, next) => {
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'questions', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
}, async (req, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const userId = (req as any).user.userId;
    
    console.log('收到上传请求，文件字段:', Object.keys(files || {}));
    console.log('请求体内容类型:', req.headers['content-type']);
    
    if (!files) {
      console.error('未找到文件对象，可能multer处理失败');
      return res.status(400).json({ error: '文件上传失败，请检查文件格式和大小（最大100MB）' });
    }
    
    if (!files.audio || !files.audio[0]) {
      console.error('未找到音频文件，可用字段:', Object.keys(files));
      return res.status(400).json({ error: '请上传音频文件（支持mp3, m4a, wav等格式）' });
    }

    const audioFile = files.audio[0];
    console.log('音频文件信息:', {
      originalname: audioFile.originalname,
      mimetype: audioFile.mimetype,
      size: audioFile.size,
      path: audioFile.path
    });

    // 检查文件是否存在
    if (!await fs.pathExists(audioFile.path)) {
      console.error('音频文件不存在:', audioFile.path);
      return res.status(400).json({ error: '音频文件上传失败，请重试' });
    }

    let questionsContent = '';

    // 题目文件为可选
    if (files.questions && files.questions[0]) {
      try {
        questionsContent = await fs.readFile(files.questions[0].path, 'utf-8');
        console.log('题目文件读取成功，长度:', questionsContent.length);
      } catch (error) {
        console.warn('读取题目文件失败，将仅使用音频:', error);
      }
    }
    
    // 创建会话（匿名用户使用userId=0）
    const session = db.createSession({
      user_id: userId || 0,
      audio_url: `/audio/${path.basename(audioFile.path)}`,
      questions: questionsContent,
      transcript: null,
      keywords: null,
      status: 'processing'
    });

    console.log('会话创建成功，ID:', session.id);

    // 异步处理音频（转文字和提取关键词）
    processAudio(audioFile.path)
      .then(async (result) => {
        const { transcript, duration } = result;
        console.log('音频转文字成功，长度:', transcript.length);
        if (duration) {
          console.log('音频时长:', duration.toFixed(2), '秒');
        }
        // 如果有题目，使用题目提取关键词；如果没有，仅从音频原文提取
        const keywords = await extractKeywords(transcript, questionsContent || '', duration);
        console.log('关键词提取成功，数量:', keywords.length);
        const keywordsJson = JSON.stringify(keywords);
        
        db.updateSession(session.id, {
          transcript,
          keywords: keywordsJson,
          duration: duration, // 保存音频时长
          status: 'completed'
        });

        // 更新统计信息（仅对已登录用户）
        if (userId && userId !== 0) {
          const stats = db.findStatisticsByUserId(userId);
          if (stats) {
            db.updateStatistics(userId, {
              total_sessions: stats.total_sessions + 1
            });
          }
        }
      })
      .catch((error) => {
        console.error('处理音频时出错:', error);
        console.error('错误堆栈:', error.stack);
        db.updateSession(session.id, { status: 'error' });
      });

    res.json({
      id: session.id,
      audioUrl: session.audio_url,
      questions: questionsContent || '',
      status: 'processing'
    });
  } catch (error: any) {
    console.error('上传文件时出错:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ error: error.message || '上传失败，请检查服务器日志' });
  }
});

// 获取会话状态
app.get('/api/session/:sessionId', optionalAuthenticate, (req, res) => {
  const { sessionId } = req.params;
  const userId = (req as any).user.userId;
  
  const session = db.findSessionById(sessionId);

  if (!session) {
    return res.status(404).json({ error: '会话不存在' });
  }
  
  // 如果是匿名用户，允许访问；如果是已登录用户，只能访问自己的会话
  if (userId && userId !== 0 && session.user_id !== userId) {
    return res.status(403).json({ error: '无权访问此会话' });
  }

  res.json({
    id: session.id,
    audioUrl: session.audio_url,
    questions: session.questions,
    transcript: session.transcript,
    keywords: session.keywords ? JSON.parse(session.keywords) : null,
    duration: (session as any).duration || undefined, // 返回音频时长
    status: session.status,
    created_at: session.created_at
  });
});

// 获取所有单词（用于显示）
app.get('/api/session/:sessionId/words', optionalAuthenticate, (req, res) => {
  const { sessionId } = req.params;
  const userId = (req as any).user.userId;
  
  const session = db.findSessionById(sessionId);

  if (!session) {
    return res.status(404).json({ error: '会话不存在' });
  }
  
  // 如果是匿名用户，允许访问；如果是已登录用户，只能访问自己的会话
  if (userId && userId !== 0 && session.user_id !== userId) {
    return res.status(403).json({ error: '无权访问此会话' });
  }

  if (!session.transcript) {
    return res.json({ words: [], status: 'processing' });
  }

  // 将原文分割成单词数组
  const words = session.transcript
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map((word, index) => ({
      id: index,
      text: word,
      clicked: false
    }));

  res.json({ 
    words, 
    keywords: session.keywords ? JSON.parse(session.keywords) : [] 
  });
});

// 获取练习选项（关键词 + 干扰词）
app.get('/api/session/:sessionId/exercise', optionalAuthenticate, (req, res) => {
  const { sessionId } = req.params;
  const userId = (req as any).user.userId;
  
  const session = db.findSessionById(sessionId);

  if (!session) {
    return res.status(404).json({ error: '会话不存在' });
  }
  
  // 如果是匿名用户，允许访问；如果是已登录用户，只能访问自己的会话
  if (userId && userId !== 0 && session.user_id !== userId) {
    return res.status(403).json({ error: '无权访问此会话' });
  }

  if (!session.transcript) {
    return res.json({ options: [], status: 'processing' });
  }

  const keywords = session.keywords ? JSON.parse(session.keywords) : [];
  
  if (keywords.length === 0) {
    return res.json({ options: [], status: 'no_keywords' });
  }

  // 获取音频时长（用于均匀分布选项）
  const audioDuration = (session as any).duration || undefined;

  // 生成练习选项（支持按时间段均匀分布）
  const options = generateExerciseOptions(keywords, session.transcript, undefined, audioDuration);
  
  // 转换为前端期望的格式
  const frontendOptions = options.map(option => ({
    word: option.text,
    isCorrect: option.isKeyword, // 关键词就是正确答案
    timeSegment: option.timeSegment // 时间段信息（可选）
  }));

  res.json({ 
    options: frontendOptions,
    transcript: session.transcript,
    keywords,
    duration: audioDuration, // 返回音频时长
    status: 'completed'
  });
});

// 获取用户的会话列表
app.get('/api/sessions', optionalAuthenticate, (req, res) => {
  const userId = (req as any).user.userId;
  const sessions = db.findSessionsByUserId(userId);

  res.json({ sessions: sessions.map(s => ({
    id: s.id,
    audio_url: s.audio_url,
    questions: s.questions,
    status: s.status,
    created_at: s.created_at
  })) });
});

// ========== 练习记录相关接口 ==========

// 保存练习记录
app.post('/api/practice', optionalAuthenticate, (req, res) => {
  try {
    const { sessionId, clickedWords, totalWords, correctAnswers, timeSpent } = req.body;
    const userId = (req as any).user.userId;

    if (!sessionId || !clickedWords || !totalWords) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    // 计算准确率：正确选择的词数 / 正确答案总数
    // 如果提供了correctAnswers，使用它；否则使用totalWords作为分母
    const correctCount = correctAnswers || totalWords;
    const userCorrectCount = Array.isArray(clickedWords) 
      ? clickedWords.filter((word: string) => {
          // 需要从session中获取正确答案列表来验证
          const session = db.findSessionById(sessionId);
          if (session && session.keywords) {
            const keywords = JSON.parse(session.keywords);
            return keywords.includes(word.toLowerCase());
          }
          return false;
        }).length
      : 0;
    const accuracy = correctCount > 0 ? (userCorrectCount / correctCount) * 100 : 0;

    // 保存练习记录（包括匿名用户）
    // 匿名用户使用userId=0，可以通过sessionId查看记录
    const record = db.createPracticeRecord({
      session_id: sessionId,
      user_id: userId || 0, // 允许匿名用户（userId=0）
      clicked_words: JSON.stringify(clickedWords),
      total_words: totalWords,
      accuracy,
      time_spent: timeSpent || 0
    });

    // 更新统计信息（仅对已登录用户）
    if (userId && userId !== 0) {
      const stats = db.findStatisticsByUserId(userId);
      if (stats) {
        const newTotalPractices = stats.total_practices + 1;
        const newTotalTime = stats.total_time_spent + (timeSpent || 0);
        const newAvgAccuracy = ((stats.average_accuracy * stats.total_practices) + accuracy) / newTotalPractices;

        db.updateStatistics(userId, {
          total_practices: newTotalPractices,
          average_accuracy: newAvgAccuracy,
          total_time_spent: newTotalTime
        });
      }
    }

    res.json({ 
      message: '练习记录保存成功',
      recordId: record.id
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 获取用户的练习记录
app.get('/api/practice/records', optionalAuthenticate, (req, res) => {
  const userId = (req as any).user.userId;
  // 允许匿名用户（userId=0）查看自己的记录
  const records = db.findPracticeRecordsByUserId(userId || 0);

  res.json({ records: records.map(r => ({
    ...r,
    clicked_words: JSON.parse(r.clicked_words)
  })) });
});

// ========== 成绩统计相关接口 ==========

// 获取用户统计信息
app.get('/api/statistics', optionalAuthenticate, (req, res) => {
  const userId = (req as any).user.userId;
  const stats = db.findStatisticsByUserId(userId);

  if (!stats) {
    return res.json({
      total_sessions: 0,
      total_practices: 0,
      average_accuracy: 0,
      total_time_spent: 0
    });
  }

  res.json({
    total_sessions: stats.total_sessions || 0,
    total_practices: stats.total_practices || 0,
    average_accuracy: stats.average_accuracy || 0,
    total_time_spent: stats.total_time_spent || 0
  });
});

// ========== 词汇练习相关接口 ==========

// 生成词汇练习选项
app.get('/api/vocabulary/practice/:sessionId', optionalAuthenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { targetCount = 100, correctCount = 15 } = req.query;
    const userId = (req as any).user.userId;
    
    const session = db.findSessionById(sessionId);

    if (!session) {
      return res.status(404).json({ error: '会话不存在' });
    }
    
    // 如果是匿名用户，允许访问；如果是已登录用户，只能访问自己的会话
    if (userId && userId !== 0 && session.user_id !== userId) {
      return res.status(403).json({ error: '无权访问此会话' });
    }

    if (!session.transcript) {
      return res.json({ words: [], status: 'processing' });
    }

    // 提取原文中的词汇
    const textWords = session.transcript
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && /^[a-zA-Z]+$/.test(word));

    // 生成练习词汇
    const practiceWords = await vocabularyService.generatePracticeWords(
      textWords, 
      parseInt(targetCount as string), 
      parseInt(correctCount as string)
    );

    res.json({
      words: practiceWords,
      targetCount: parseInt(targetCount as string),
      correctCount: parseInt(correctCount as string),
      status: 'completed'
    });
  } catch (error: any) {
    console.error('生成词汇练习失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取词汇统计信息
app.get('/api/vocabulary/stats', optionalAuthenticate, async (req, res) => {
  try {
    const stats = await vocabularyService.getVocabularyStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 根据条件筛选词汇
app.get('/api/vocabulary/filter', optionalAuthenticate, async (req, res) => {
  try {
    const { category, level, frequency, limit = 50 } = req.query;
    const words = await vocabularyService.getVocabularyByFilters(
      category as string,
      level as string,
      frequency as string,
      parseInt(limit as string)
    );
    res.json(words);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单词定义
app.get('/api/vocabulary/definition/:word', optionalAuthenticate, async (req, res) => {
  try {
    const { word } = req.params;
    const definition = await vocabularyService.getWordDefinition(word);
    
    if (!definition) {
      return res.status(404).json({ error: '未找到该单词的定义' });
    }
    
    res.json({ word, definition });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 预加载词汇库
app.post('/api/vocabulary/preload', optionalAuthenticate, async (req, res) => {
  try {
    await vocabularyService.preloadVocabulary();
    res.json({ message: '词汇库预加载完成' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 生成相关词汇
app.get('/api/vocabulary/related', optionalAuthenticate, async (req, res) => {
  try {
    const { words, limit = 50 } = req.query;
    
    if (!words) {
      return res.status(400).json({ error: '请提供种子词汇' });
    }
    
    const seedWords = (words as string).split(',').map(w => w.trim()).filter(w => w.length > 0);
    const relatedWords = await vocabularyService.generateRelatedWords(
      seedWords, 
      parseInt(limit as string)
    );
    
    res.json(relatedWords);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 添加一个测试端点
app.get('/api/test', (req, res) => {
  res.json({ message: '服务器正常运行' });
});

app.listen(PORT, () => {
  // 预加载词汇库
  vocabularyService.preloadVocabulary().catch(console.error);
  
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log('可用API端点:');
  console.log('  - POST /api/upload - 上传音频文件');
  console.log('  - GET /api/sessions - 获取会话列表');
  console.log('  - GET /api/session/:id - 获取会话详情');
  console.log('  - GET /api/session/:id/words - 获取会话单词');
  console.log('  - GET /api/session/:id/exercise - 获取练习选项');
  console.log('  - POST /api/practice - 保存练习记录');
  console.log('  - GET /api/vocabulary/stats - 获取词汇统计');
  console.log('  - GET /api/vocabulary/practice/:sessionId - 生成词汇练习');
});