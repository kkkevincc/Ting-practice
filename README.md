# 🎧 英语听力练习项目 (Ting-practice)

> 基于 AI 语音识别技术的智能英语听力训练平台，帮助学习者通过交互式练习提升听力理解能力。

**核心亮点：**
- 🚀 零配置快速上手，支持匿名使用
- 🧠 集成 SiliconFlow AI 语音识别，准确率高
- 🎯 智能关键词提取算法，自动生成练习题目
- 💡 交互式单词点击练习，提升学习效率
- 📊 完整的练习记录和统计分析系统

## ✨ 功能特点

### 🎵 音频处理
- 支持多种音频格式（MP3、WAV、M4A 等）
- 音频文件大小限制：100MB
- 可调节播放速度（0.5x - 2x）
- 实时音频播放控制

### 🤖 AI 智能识别
- **SiliconFlow 语音识别 API**：高精度音频转文字
- 自动识别音频原文，支持中英文混合
- 处理速度快，响应时间约 10-30 秒（取决于音频长度）
- 未配置 API 时自动使用模拟数据演示

### 🔑 智能关键词提取
- 基于词频分析的本地算法
- 自动提取音频中的关键单词
- 生成包含干扰词的练习选项（100 个单词）
- 智能干扰词策略：40% 上下文相关 + 60% 通用干扰

### 🖱️ 交互式练习
- 点击式单词选择界面
- 实时反馈和结果统计
- 支持多次练习和重试
- 清晰的正确/错误提示

### 🎨 现代化 UI
- 深色主题设计，护眼舒适
- 翠绿色系配色（专业商务风格）
- 玻璃态半透明效果
- 流畅的动画和交互体验
- 响应式设计，支持移动端

### 👤 用户系统
- 可选用户注册/登录（JWT 认证）
- 支持匿名使用，无需注册即可体验
- 注册用户享受完整数据统计功能
- 安全的密码加密存储

### 📊 数据统计
- 练习记录追踪
- 学习会话管理
- 个人成绩统计
- 历史记录查看

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

## 🚀 部署说明

### GitHub Pages 部署（仅前端）

本项目为全栈应用，GitHub Pages 只能部署静态前端。部署步骤：

1. **构建前端项目**：
```bash
cd frontend
npm run build
```

2. **配置 GitHub Pages**：
   - 进入仓库 Settings → Pages
   - Source 选择 `Deploy from a branch`
   - Branch 选择 `gh-pages`，文件夹选择 `/ (root)`
   - 或者使用 GitHub Actions 自动部署

3. **修改 API 地址**：
   - 部署后需要将前端 API 请求地址改为实际后端服务器地址
   - 修改 `frontend/src/services/api.ts` 中的 `baseURL`

### 完整部署（前端 + 后端）

**后端部署选项：**
- **Vercel**：支持 Node.js 无服务器函数
- **Railway**：支持完整 Node.js 应用
- **Heroku**：传统 PaaS 平台
- **自己的服务器**：VPS 或云服务器

**前端部署选项：**
- **GitHub Pages**：免费静态托管
- **Vercel**：自动部署，支持 CI/CD
- **Netlify**：静态网站托管
- **Cloudflare Pages**：快速 CDN 加速

### 环境变量配置

部署时需要在部署平台配置以下环境变量：
- `SILICONFLOW_API_KEY`：SiliconFlow API 密钥
- `JWT_SECRET`：JWT 认证密钥（生产环境请使用强密码）
- `PORT`：服务器端口（通常由平台自动分配）

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
