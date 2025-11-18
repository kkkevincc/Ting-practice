# API配置说明

## 📋 概述

本项目使用**两套独立的API**：
1. **音频转写API**：使用 SiliconFlow API 进行音频转文字
2. **AI关键词筛选API**：使用 agentrouter.org 进行智能关键词提取

---

## 🔧 配置步骤

### 1. 编辑 `backend/.env` 文件

在 `backend` 目录下创建或编辑 `.env` 文件，添加以下配置：

```env
# ========== 音频转写API配置 ==========
# SiliconFlow API密钥（用于音频转文字）
SILICONFLOW_API_KEY=your_siliconflow_api_key_here

# ========== AI关键词筛选API配置 ==========
# AI API基础URL（用于智能关键词筛选）
AI_API_BASE_URL=https://agentrouter.org/v1/chat/completions

# AI API密钥（用于智能关键词筛选）
AI_API_KEY=sk-gxVAvnI3eekI0lUkazwQKyqZBAucNsupC5uqKo0YqnPoxswe

# AI API模型（用于智能关键词筛选）
AI_API_MODEL=glm-4.6

# 是否使用AI智能关键词筛选
USE_AI_KEYWORD_FILTER=true
```

### 2. 配置说明

#### 音频转写API（SiliconFlow）
- **用途**：将上传的音频文件转换为文字
- **API端点**：`https://api.siliconflow.cn/v1/audio/transcriptions`
- **模型**：`FunAudioLLM/SenseVoiceSmall`（固定）
- **环境变量**：`SILICONFLOW_API_KEY`
- **获取密钥**：https://siliconflow.cn/

#### AI关键词筛选API（agentrouter.org）
- **用途**：智能分析转写文本和题目，提取与听力解答最相关的关键词
- **API端点**：`https://agentrouter.org/v1/chat/completions`
- **模型**：`glm-4.6`
- **环境变量**：
  - `AI_API_BASE_URL`：API基础URL（可选，默认已设置）
  - `AI_API_KEY`：API密钥
  - `AI_API_MODEL`：模型名称（可选，默认 `glm-4.6`）
  - `USE_AI_KEYWORD_FILTER`：是否启用（`true` 或 `false`）

---

## 🎯 功能说明

### 音频转写功能
- **始终使用** SiliconFlow API（如果配置了密钥）
- **未配置时**：自动使用模拟数据
- **独立运行**：不受AI关键词筛选配置影响

### AI关键词筛选功能
- **可选功能**：需要设置 `USE_AI_KEYWORD_FILTER=true` 才启用
- **启用时**：使用 agentrouter.org + glm-4.6 模型智能筛选关键词
- **未启用时**：使用本地基于词频的关键词提取方法
- **自动回退**：AI筛选失败时自动切换到本地方法

---

## 📝 完整配置示例

```env
# ========== 音频转写API配置 ==========
SILICONFLOW_API_KEY=sk-your_siliconflow_key_here

# ========== AI关键词筛选API配置 ==========
AI_API_BASE_URL=https://agentrouter.org/v1/chat/completions
AI_API_KEY=sk-gxVAvnI3eekI0lUkazwQKyqZBAucNsupC5uqKo0YqnPoxswe
AI_API_MODEL=glm-4.6
USE_AI_KEYWORD_FILTER=true

# ========== 其他配置 ==========
JWT_SECRET=your-secret-key-change-in-production
PORT=3001
```

---

## ✅ 验证配置

### 1. 检查环境变量

启动后端服务后，查看控制台输出：

**音频转写API**：
```
✅ API密钥已配置，开始调用SiliconFlow API...
   API密钥: sk-xxxxx...
   📡 API端点: https://api.siliconflow.cn/v1/audio/transcriptions
   🤖 使用模型: FunAudioLLM/SenseVoiceSmall
```

**AI关键词筛选API**（如果启用）：
```
🤖 使用AI API智能筛选关键词...
   📡 AI API端点: https://agentrouter.org/v1/chat/completions
   🤖 使用模型: glm-4.6
   🔑 API密钥: sk-gxVAvnI3...
```

### 2. 测试功能

1. **上传音频文件**：应该能正常转写
2. **查看关键词**：如果启用了AI筛选，关键词应该更精准
3. **查看后端日志**：确认API调用成功

---

## 🔍 故障排查

### 问题1：音频转写失败
- **检查**：`SILICONFLOW_API_KEY` 是否正确配置
- **解决**：确认密钥有效，或使用模拟模式

### 问题2：AI关键词筛选未生效
- **检查**：
  1. `USE_AI_KEYWORD_FILTER=true` 是否设置
  2. `AI_API_KEY` 是否正确配置
  3. 后端日志是否有错误信息
- **解决**：
  - 确认环境变量已正确设置
  - 重启后端服务
  - 查看后端日志中的错误信息

### 问题3：API调用失败
- **检查**：
  1. 网络连接是否正常
  2. API密钥是否有效
  3. API端点是否正确
- **解决**：
  - 系统会自动回退到本地方法
  - 检查API服务状态
  - 验证API密钥权限

---

## 📌 重要提示

1. **两套API独立配置**：
   - 音频转写使用 `SILICONFLOW_API_KEY`
   - AI关键词筛选使用 `AI_API_KEY`
   - 两者互不影响

2. **音频转写优先级**：
   - 音频转写功能始终优先使用配置的API
   - 未配置时自动使用模拟数据

3. **AI筛选可选**：
   - AI关键词筛选是可选的增强功能
   - 未启用时使用本地方法，功能完全正常

4. **自动回退机制**：
   - AI筛选失败时自动切换到本地方法
   - 确保系统稳定运行

---

**配置完成后，请重启后端服务以使配置生效。**
