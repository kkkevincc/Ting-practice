# 英语听力练习项目

一个现代化的英语听力练习应用，支持音频上传、AI语音识别和交互式单词练习。

## 功能特点

- 🎵 上传听力音频和题目文件
- 🤖 AI自动识别音频原文（使用SiliconFlow语音识别API）
- 🔑 智能提取关键词（本地算法，基于词频分析）
- 🖱️ 交互式单词点击练习
- 🎨 苹果风格的现代化UI设计
- 👤 用户认证系统（可选，支持匿名使用）
- 📊 练习统计和成绩追踪

## 技术栈

### 前端
- React + TypeScript
- Vite (端口: 3000)
- Tailwind CSS
- Axios (API调用)

### 后端
- Node.js + Express + TypeScript (端口: 3001)
- SiliconFlow API (语音识别)
- 本地算法 (关键词提取)
- JSON文件存储 (用户数据、会话、统计)

## 安装步骤

### 1. 安装依赖

```bash
npm run install:all
```

### 2. 配置环境变量

在 `backend` 目录下创建 `.env` 文件：

```bash
cd backend
cp env.example .env
```

编辑 `.env` 文件，填入配置信息：

```
SILICONFLOW_API_KEY=your_siliconflow_api_key_here
JWT_SECRET=your-secret-key-change-in-production
PORT=3001
```

**重要**：
- 如果没有配置 `SILICONFLOW_API_KEY`，系统会自动使用模拟数据进行演示
- `JWT_SECRET` 用于用户认证，生产环境请务必更改
- 获取 SiliconFlow API Key：访问 https://siliconflow.cn/

### 3. 启动项目

开发模式（同时启动前后端）：

```bash
npm run dev
```

或者分别启动：

```bash
# 启动后端
npm run dev:backend

# 启动前端（新终端）
npm run dev:frontend
```

## 使用说明

1. 访问 http://localhost:3000
2. （可选）注册/登录账号，或以匿名用户继续
3. 上传音频文件（支持 MP3、WAV、M4A 等格式）
4. （可选）上传题目文件（.txt 或 .md 格式）
5. 等待AI处理音频（转文字和提取关键词）
6. 播放音频，根据听到的内容点击关键词进行练习
7. 提交答案查看结果和统计信息

## 项目结构

```
听力练习项目/
├── frontend/          # 前端代码
│   ├── src/
│   │   ├── components/    # React组件
│   │   └── App.tsx        # 主应用
│   └── package.json
├── backend/           # 后端代码
│   ├── src/
│   │   ├── services/      # 业务逻辑服务
│   │   └── index.ts       # 服务器入口
│   └── package.json
└── package.json       # 根package.json
```

## 注意事项

- SiliconFlow API Key 为可选配置（未配置时使用模拟数据）
- 音频文件大小限制为 100MB
- 处理时间取决于音频长度和网络速度
- 前端运行在端口 3000，后端运行在端口 3001
- 支持匿名使用，注册用户可享受数据统计功能

## 端口配置

- 前端开发服务器：http://localhost:3000
- 后端API服务器：http://localhost:3001
- API代理：前端自动代理 `/api` 和 `/audio` 请求到后端

## 数据存储

项目使用JSON文件存储数据，位于 `backend/data/` 目录：
- `users.json` - 用户信息
- `sessions.json` - 学习会话
- `practice_records.json` - 练习记录
- `statistics.json` - 用户统计数据

音频文件存储在 `backend/uploads/audio/` 目录
