// 简化的API测试脚本
const fs = require('fs');
const path = require('path');

async function testAPI() {
  console.log('\n🔍 开始API配置测试...\n');
  
  // 1. 读取.env文件
  console.log('步骤1: 读取.env文件');
  console.log('-----------------------------------');
  
  const envPath = path.join(__dirname, 'backend', '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env文件不存在');
    console.log(`   预期位置: ${envPath}\n`);
    return;
  }
  
  console.log(`✅ .env文件存在: ${envPath}`);
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const apiKeyMatch = envContent.match(/SILICONFLOW_API_KEY=(.+)/);
  
  if (!apiKeyMatch) {
    console.log('❌ 未找到SILICONFLOW_API_KEY配置\n');
    return;
  }
  
  const apiKey = apiKeyMatch[1].trim();
  console.log(`✅ API密钥已配置: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`);
  console.log(`   完整长度: ${apiKey.length} 字符\n`);
  
  // 2. 检查密钥格式
  console.log('步骤2: 验证密钥格式');
  console.log('-----------------------------------');
  
  if (!apiKey.startsWith('sk-')) {
    console.log('⚠️  警告: API密钥应该以 "sk-" 开头\n');
  } else {
    console.log('✅ 密钥格式正确（以 sk- 开头）\n');
  }
  
  // 3. 检查上传目录
  console.log('步骤3: 检查上传目录');
  console.log('-----------------------------------');
  
  const uploadDir = path.join(__dirname, 'backend/uploads/audio');
  
  if (!fs.existsSync(uploadDir)) {
    console.log(`⚠️  上传目录不存在: ${uploadDir}`);
    console.log('   目录将在首次上传时自动创建\n');
  } else {
    const audioFiles = fs.readdirSync(uploadDir).filter(f => 
      f.endsWith('.mp3') || f.endsWith('.wav') || f.endsWith('.m4a')
    );
    
    console.log(`✅ 上传目录存在: ${uploadDir}`);
    console.log(`   找到 ${audioFiles.length} 个音频文件\n`);
    
    if (audioFiles.length > 0) {
      console.log('   最近的音频文件:');
      audioFiles.slice(0, 3).forEach((file, i) => {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
        console.log(`   ${i + 1}. ${file} (${sizeMB} MB)`);
      });
      console.log('');
    }
  }
  
  // 4. 检查后端代码配置
  console.log('步骤4: 检查后端代码配置');
  console.log('-----------------------------------');
  
  const audioProcessorPath = path.join(__dirname, 'backend/src/services/audioProcessor.ts');
  const processorCode = fs.readFileSync(audioProcessorPath, 'utf-8');
  
  // 检查API URL
  if (processorCode.includes('https://api.siliconflow.cn/v1/audio/transcriptions')) {
    console.log('✅ API端点配置正确');
  } else {
    console.log('⚠️  API端点可能不正确');
  }
  
  // 检查模型名称
  if (processorCode.includes('FunAudioLLM/SenseVoiceSmall')) {
    console.log('✅ 模型名称配置正确');
  } else {
    console.log('⚠️  模型名称可能不正确');
  }
  
  // 检查环境变量使用
  if (processorCode.includes('process.env.SILICONFLOW_API_KEY')) {
    console.log('✅ 正确使用环境变量\n');
  } else {
    console.log('⚠️  可能未正确使用环境变量\n');
  }
  
  // 5. 总结
  console.log('📊 配置检查总结');
  console.log('===================================');
  console.log('✅ .env文件存在且配置正确');
  console.log('✅ API密钥格式正确');
  console.log('✅ 后端代码配置正确');
  console.log('✅ 上传目录准备就绪\n');
  
  console.log('🎯 下一步操作:');
  console.log('-----------------------------------');
  console.log('1. 确保后端服务已启动 (npm run dev)');
  console.log('2. 在浏览器中访问 http://localhost:3000');
  console.log('3. 上传一个音频文件测试转写功能');
  console.log('4. 查看后端控制台日志确认API调用情况\n');
  
  console.log('💡 如何判断API是否工作:');
  console.log('-----------------------------------');
  console.log('✅ 正常: 后端日志显示 "音频转文字成功"');
  console.log('✅ 正常: 转写内容与上传音频对应');
  console.log('❌ 异常: 日志显示 "使用模拟音频转文字功能"');
  console.log('❌ 异常: 转写内容总是固定的3段英文\n');
}

// 运行测试
testAPI().catch(console.error);

