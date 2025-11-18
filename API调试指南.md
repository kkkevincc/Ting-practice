# API配置调试指南

## 🔍 如何检查API是否正确配置

### 1. 检查环境变量文件 (.env)

**文件位置**: `backend/.env`

**必须包含以下内容**:
```env
SILICONFLOW_API_KEY=sk-fxjhwmgwogymnmcbcyxyxshdjtuaxbdvvfasxearstkixwdz
JWT_SECRET=your-very-secure-jwt-secret-key-change-this-in-production
PORT=3001
```

#### ✅ 检查步骤:

1. **确认文件存在**:
   ```bash
   ls -la /Users/zhenkunchen/Desktop/听力练习项目/backend/.env
   ```

2. **查看文件内容**:
   ```bash
   cat /Users/zhenkunchen/Desktop/听力练习项目/backend/.env
   ```

3. **确认API密钥正确**:
   - 密钥应该以 `sk-` 开头
   - 长度应该很长（50+字符）
   - 不应包含空格或换行符

---

### 2. 检查后端服务是否读取了API密钥

**文件位置**: `backend/src/services/audioProcessor.ts`

**关键代码** (第19-22行):

```typescript
// 检查API密钥是否配置
if (!process.env.SILICONFLOW_API_KEY) {
  console.log('未配置SiliconFlow API密钥，使用模拟模式');
  return processAudioMock();
}
```

#### ✅ 检查步骤:

1. **启动后端服务时查看控制台输出**:
   ```bash
   cd backend && npm run dev
   ```

2. **上传音频后，查看日志**:
   - ❌ 如果看到 `"未配置SiliconFlow API密钥，使用模拟模式"` → API密钥未生效
   - ✅ 如果看到 `"处理音频文件: ..."` → API配置正常

3. **查看完整的API调用日志**:
   - ✅ 正常: `"音频转文字成功，文本长度: XXX"`
   - ❌ 失败: `"SiliconFlow API调用失败，切换到模拟模式: ..."`

---

### 3. API配置位置详解

#### 📂 文件结构:
```
听力练习项目/
├── backend/
│   ├── .env                          ← API密钥配置文件 (主要)
│   ├── env.example                   ← 配置示例文件
│   └── src/
│       └── services/
│           └── audioProcessor.ts     ← API调用逻辑
```

#### 🔧 配置文件详解:

**`backend/.env`** (实际配置):
```env
# SiliconFlow API配置（必须）
SILICONFLOW_API_KEY=sk-fxjhwmgwogymnmcbcyxyxshdjtuaxbdvvfasxearstkixwdz

# JWT密钥（必须）
JWT_SECRET=your-very-secure-jwt-secret-key-change-this-in-production

# 后端端口
PORT=3001
```

**`backend/env.example`** (仅作参考):
- 这个文件不会被程序读取
- 只用于展示配置格式
- 修改这个文件不会影响程序运行

---

### 4. 验证API是否真正工作

#### 方法1: 检查后端日志

1. **停止所有服务**
2. **启动后端** (查看完整日志):
   ```bash
   cd /Users/zhenkunchen/Desktop/听力练习项目/backend
   npm run dev
   ```

3. **启动前端**:
   ```bash
   cd /Users/zhenkunchen/Desktop/听力练习项目/frontend
   npm run dev
   ```

4. **上传音频文件，观察后端控制台**:
   - 看到 `"处理音频文件: ..."` ✅
   - 看到 `"使用模拟音频转文字功能"` ❌ (说明API未生效)
   - 看到 `"音频转文字成功"` ✅ (API正常工作)

#### 方法2: 检查转写文本内容

**Mock模式的特征** (说明API未生效):
- 转写内容总是以下三段之一:
  - `"Welcome to today's lecture on environmental science..."`
  - `"Good morning everyone. Today we will discuss..."`
  - `"Hello and welcome to this business presentation..."`

**真实API模式的特征** (说明API正常):
- 转写内容与你上传的音频内容完全对应
- 每次上传不同音频，转写结果都不同

#### 方法3: 直接测试API

在终端运行:
```bash
curl --request POST /
  --url https://api.siliconflow.cn/v1/audio/transcriptions /
  --header 'Authorization: Bearer sk-fxjhwmgwogymnmcbcyxyxshdjtuaxbdvvfasxearstkixwdz' /
  --header 'Content-Type: multipart/form-data' /
  --form model=FunAudioLLM/SenseVoiceSmall /
  --form file=@/path/to/your/audio.mp3
```

如果返回 JSON 格式的转写结果，说明API密钥有效。

---

### 5. 常见问题排查

#### ❌ 问题1: 转写总是显示固定的英文文本

**原因**: API密钥未生效，程序运行在Mock模式

**解决方案**:
1. 确认 `backend/.env` 文件存在
2. 确认文件中 `SILICONFLOW_API_KEY` 拼写正确
3. 确认密钥前后没有空格
4. **重启后端服务** (修改.env后必须重启)

#### ❌ 问题2: 后端日志显示 "未配置SiliconFlow API密钥"

**原因**: 环境变量未被正确读取

**解决方案**:
1. 检查 `.env` 文件是否在 `backend/` 目录下 (不是根目录)
2. 确认文件名是 `.env`，不是 `env` 或 `.env.example`
3. 在 Mac/Linux 上，使用 `ls -la backend/` 查看隐藏文件
4. 重新创建 `.env` 文件:
   ```bash
   cd /Users/zhenkunchen/Desktop/听力练习项目/backend
   touch .env
   nano .env
   # 粘贴配置，Ctrl+X 保存
   ```

#### ❌ 问题3: API调用失败，显示错误

**可能的错误信息**:
- `"SiliconFlow API错误: 401"` → API密钥无效或过期
- `"SiliconFlow API错误: 429"` → API请求过于频繁，已达限额
- `"SiliconFlow API错误: 500"` → SiliconFlow服务器错误

**解决方案**:
1. **401错误**: 检查API密钥是否正确
2. **429错误**: 等待一段时间后重试，或升级API套餐
3. **500错误**: 稍后重试，可能是服务商临时问题

---

### 6. 验证清单

使用以下清单逐项检查:

- [ ] `backend/.env` 文件存在
- [ ] `.env` 文件中有 `SILICONFLOW_API_KEY=sk-...` 行
- [ ] API密钥长度 > 50 字符
- [ ] API密钥以 `sk-` 开头
- [ ] 后端服务已重启 (修改.env后)
- [ ] 后端日志未显示 "使用模拟模式"
- [ ] 上传音频后，转写内容与音频对应
- [ ] 后端日志显示 "音频转文字成功"

---

### 7. 手动测试步骤

1. **停止所有服务** (Ctrl+C)

2. **检查.env文件**:
   ```bash
   cat /Users/zhenkunchen/Desktop/听力练习项目/backend/.env
   ```
   应该看到你的API密钥

3. **启动后端** (观察日志):
   ```bash
   cd /Users/zhenkunchen/Desktop/听力练习项目/backend
   npm run dev
   ```

4. **另开一个终端，启动前端**:
   ```bash
   cd /Users/zhenkunchen/Desktop/听力练习项目/frontend
   npm run dev
   ```

5. **在浏览器上传音频**

6. **回到后端终端**，应该看到:
   ```
   处理音频文件: /path/to/audio, 大小: X.XX MB
   音频转文字成功，文本长度: XXX
   ```

   **不应该看到**:
   ```
   未配置SiliconFlow API密钥，使用模拟模式
   使用模拟音频转文字功能
   ```

---

## 📞 需要帮助?

如果以上步骤都无法解决问题，请提供以下信息:

1. **后端启动日志截图** (完整的控制台输出)
2. **上传音频后的日志截图**
3. **`.env` 文件内容** (可以隐藏API密钥的中间部分)
4. **转写结果截图** (显示实际转写的文本)

这样可以更快地定位问题！

---

## 🎯 快速诊断命令

运行以下命令快速诊断:

```bash
# 1. 检查.env文件是否存在
test -f /Users/zhenkunchen/Desktop/听力练习项目/backend/.env && echo "✅ .env文件存在" || echo "❌ .env文件不存在"

# 2. 检查API密钥是否配置
grep "SILICONFLOW_API_KEY" /Users/zhenkunchen/Desktop/听力练习项目/backend/.env && echo "✅ API密钥已配置" || echo "❌ API密钥未配置"

# 3. 显示API密钥前10个字符（用于验证）
grep "SILICONFLOW_API_KEY" /Users/zhenkunchen/Desktop/听力练习项目/backend/.env | cut -c1-30
```

预期输出:
```
✅ .env文件存在
✅ API密钥已配置
SILICONFLOW_API_KEY=sk-fxj...
```

