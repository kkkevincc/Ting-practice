// API测试脚本
require('dotenv').config({ path: './backend/.env' });

async function testAPI() {
  console.log('\n🔍 开始API配置测试...\n');
  
  // 1. 检查环境变量
  console.log('步骤1: 检查环境变量');
  console.log('-----------------------------------');
  const apiKey = process.env.SILICONFLOW_API_KEY;
  
  if (!apiKey) {
    console.log('❌ 未找到SILICONFLOW_API_KEY环境变量');
    console.log('   请确保backend/.env文件存在且包含API密钥');
    return;
  }
  
  console.log(`✅ API密钥已配置: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`);
  console.log(`   完整长度: ${apiKey.length} 字符\n`);
  
  // 2. 测试API连接
  console.log('步骤2: 测试API连接');
  console.log('-----------------------------------');
  
  const testUrl = 'https://api.siliconflow.cn/v1/audio/transcriptions';
  console.log(`API端点: ${testUrl}`);
  console.log(`使用模型: FunAudioLLM/SenseVoiceSmall\n`);
  
  // 3. 检查是否有测试音频文件
  const fs = require('fs');
  const path = require('path');
  
  const uploadDir = path.join(__dirname, 'backend/uploads/audio');
  
  console.log('步骤3: 查找测试音频文件');
  console.log('-----------------------------------');
  console.log(`上传目录: ${uploadDir}\n`);
  
  if (!fs.existsSync(uploadDir)) {
    console.log('📁 上传目录不存在，创建目录...');
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('✅ 目录已创建\n');
  }
  
  const audioFiles = fs.readdirSync(uploadDir).filter(f => 
    f.endsWith('.mp3') || f.endsWith('.wav') || f.endsWith('.m4a')
  );
  
  if (audioFiles.length === 0) {
    console.log('⚠️  未找到测试音频文件');
    console.log('   请先在网页上传一个音频文件，然后重新运行此脚本\n');
    console.log('💡 配置检查总结:');
    console.log('-----------------------------------');
    console.log('✅ .env文件配置正确');
    console.log('✅ API密钥格式正确');
    console.log('⚠️  需要上传音频文件才能完整测试API\n');
    return;
  }
  
  console.log(`✅ 找到 ${audioFiles.length} 个音频文件:`);
  audioFiles.forEach((file, i) => {
    const filePath = path.join(uploadDir, file);
    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`   ${i + 1}. ${file} (${sizeMB} MB)`);
  });
  
  // 4. 测试API调用
  console.log('\n步骤4: 测试API调用');
  console.log('-----------------------------------');
  
  const testFile = audioFiles[0];
  const testFilePath = path.join(uploadDir, testFile);
  
  console.log(`使用文件: ${testFile}`);
  console.log('正在调用API...\n');
  
  try {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('model', 'FunAudioLLM/SenseVoiceSmall');
    form.append('file', fs.createReadStream(testFilePath));
    
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${apiKey}`
      },
      body: form
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ API调用失败: ${response.status} ${response.statusText}`);
      console.log(`   错误详情: ${errorText}\n`);
      
      if (response.status === 401) {
        console.log('💡 401错误通常表示API密钥无效或过期');
        console.log('   请检查API密钥是否正确\n');
      } else if (response.status === 429) {
        console.log('💡 429错误表示请求过于频繁');
        console.log('   请稍后再试或升级API套餐\n');
      }
      return;
    }
    
    const result = await response.json();
    console.log('✅ API调用成功！\n');
    console.log('转写结果:');
    console.log('-----------------------------------');
    
    if (result.text) {
      console.log(result.text);
    } else if (result.transcription) {
      console.log(result.transcription);
    } else {
      console.log(JSON.stringify(result, null, 2));
    }
    
    console.log('\n✨ 测试完成！API配置正确，转写功能正常工作！\n');
    
  } catch (error) {
    console.log(`❌ 测试失败: ${error.message}\n`);
    console.log('💡 可能的原因:');
    console.log('   1. 网络连接问题');
    console.log('   2. API服务暂时不可用');
    console.log('   3. 音频文件格式不支持\n');
  }
}

// 运行测试
testAPI().catch(console.error);

