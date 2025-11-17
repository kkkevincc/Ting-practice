# API配置说明

## 🔑 配置SiliconFlow API密钥

要启用真实的音频转文字功能，请按以下步骤配置：

### 步骤1: 获取API密钥

1. 访问 https://siliconflow.cn/
2. 注册/登录账号
3. 在控制台获取API密钥

### 步骤2: 创建配置文件

在 `backend` 目录创建 `.env` 文件：

```bash
cd backend
touch .env
```

### 步骤3: 编辑配置文件

复制以下内容到 `.env` 文件：

```env
# SiliconFlow API密钥（用于音频转文字）
# 请替换为你的真实API密钥
SILICONFLOW_API_KEY=你的API密钥

# JWT密钥（用于用户认证）
JWT_SECRET=listening-practice-secret-key-2024-production

# 服务器端口
PORT=3001
```

### 步骤4: 重启服务器

```bash
# 在项目根目录
npm run dev
```

## 📝 说明

- **未配置API密钥时**：系统自动使用模拟数据（3个预设英语文本）
- **已配置API密钥后**：使用真实的AI语音识别转录音频
- **JWT密钥**：用于用户认证，建议生产环境使用强密钥

## 🔒 安全提示

- ⚠️ `.env` 文件已被 `.gitignore` 排除，不会上传到GitHub
- ⚠️ 请勿将API密钥直接写入代码或提交到版本控制
- ⚠️ 生产环境请使用强随机JWT密钥

## 🚀 快速测试（无需API密钥）

即使不配置API密钥，你也可以：
1. 上传音频文件
2. 查看模拟转录结果
3. 体验完整的听力练习功能

模拟数据包含3个场景的英语听力材料，足够测试所有功能。

