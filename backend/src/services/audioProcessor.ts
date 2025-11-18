import fs from 'fs-extra';
import path from 'path';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

export async function processAudio(audioPath: string): Promise<string> {
  try {
    // 检查文件是否存在
    if (!await fs.pathExists(audioPath)) {
      throw new Error(`音频文件不存在: ${audioPath}`);
    }

    // 检查文件大小
    const stats = await fs.stat(audioPath);
    console.log(`处理音频文件: ${audioPath}, 大小: ${(stats.size / 1024 / 1024).toFixed(2)}MB`);

    // 检查API密钥是否配置
    if (!process.env.SILICONFLOW_API_KEY) {
      console.log('❌ 未配置SiliconFlow API密钥，使用模拟模式');
      return processAudioMock();
    }

    console.log('✅ API密钥已配置，开始调用SiliconFlow API...');
    console.log(`   API密钥: ${process.env.SILICONFLOW_API_KEY.substring(0, 10)}...`);

    // 使用SiliconFlow API进行语音识别
    try {
      console.log('🚀 正在调用SiliconFlow API进行音频转写...');
      const transcription = await processAudioWithSiliconFlow(audioPath);
      console.log(`✅ 音频转文字成功！文本长度: ${transcription.length} 字符`);
      console.log(`📝 转写预览: ${transcription.substring(0, 100)}...`);
      return transcription;
    } catch (apiError: any) {
      // 如果API调用失败，自动切换到mock模式
      console.log(`❌ SiliconFlow API调用失败，切换到模拟模式`);
      console.log(`   错误信息: ${apiError.message}`);
      return processAudioMock();
    }
  } catch (error: any) {
    console.error('音频处理错误:', error);
    console.log('切换到模拟模式...');
    return processAudioMock();
  }
}

async function processAudioWithSiliconFlow(audioPath: string): Promise<string> {
  const url = 'https://api.siliconflow.cn/v1/audio/transcriptions';
  const model = 'FunAudioLLM/SenseVoiceSmall';
  
  console.log(`   📡 API端点: ${url}`);
  console.log(`   🤖 使用模型: ${model}`);
  console.log(`   📁 音频文件: ${path.basename(audioPath)}`);
  
  try {
    // 使用 axios 和 form-data，这是最可靠的方式
    const { default: FormData } = await import('form-data');
    
    const form = new FormData();
    form.append('model', model);
    form.append('file', fs.createReadStream(audioPath));

    console.log(`   ⏳ 使用 axios 发送请求到SiliconFlow服务器...`);
    
    const response = await axios.post(url, form, {
      headers: {
        ...form.getHeaders(), // 让 form-data 自动设置正确的 Content-Type 和 boundary
        'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });
    
    console.log(`   📬 收到响应: ${response.status} ${response.statusText}`);
    console.log(`   📦 API响应数据类型:`, typeof response.data);
    console.log(`   🔍 响应包含字段:`, Object.keys(response.data || {}));
    
    const data = response.data;
    
    // 根据SiliconFlow API的响应格式提取文本
    if (data.text) {
      console.log(`   ✅ 成功提取转写文本（从data.text字段）`);
      return data.text;
    } else if (data.transcription) {
      console.log(`   ✅ 成功提取转写文本（从data.transcription字段）`);
      return data.transcription;
    } else if (typeof data === 'string') {
      console.log(`   ✅ 成功提取转写文本（响应本身是字符串）`);
      return data;
    } else {
      console.error(`   ❌ 未知的API响应格式:`, JSON.stringify(data));
      throw new Error('API响应格式未知');
    }
    
  } catch (error: any) {
    if (error.response) {
      // 服务器返回了错误响应
      console.error(`   ❌ SiliconFlow API错误: ${error.response.status} ${error.response.statusText}`);
      console.error(`   📄 错误详情:`, error.response.data);
      throw new Error(`SiliconFlow API错误: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error(`   ❌ 网络错误: 无法连接到SiliconFlow服务器`);
      throw new Error('网络错误: 无法连接到API服务器');
    } else {
      // 其他错误
      console.error(`   ❌ 请求配置错误:`, error.message);
      throw error;
    }
  }
}

// 模拟音频转文字功能
function processAudioMock(): string {
  console.log('');
  console.log('⚠️  =====================================');
  console.log('⚠️  使用模拟音频转文字功能（Mock模式）');
  console.log('⚠️  API未被真正调用，返回示例文本');
  console.log('⚠️  =====================================');
  console.log('');
  
  // 生成一段示例听力材料
  const sampleTranscripts = [
    `Welcome to today's lecture on environmental science. 
    Climate change is one of the most pressing challenges facing our planet. 
    The Earth's average temperature has risen by approximately 1.1 degrees Celsius since pre-industrial times. 
    This warming is primarily caused by human activities, especially the burning of fossil fuels. 
    We need to reduce carbon dioxide emissions and transition to renewable energy sources. 
    Individual actions like using public transportation, reducing energy consumption, and supporting sustainable practices can make a significant difference.`,

    `Good morning everyone. Today we will discuss the topic of artificial intelligence in healthcare. 
    AI has the potential to revolutionize medical diagnosis and treatment. 
    Machine learning algorithms can analyze medical images with remarkable accuracy. 
    However, we must also consider the ethical implications of AI in medicine. 
    Patient privacy and data security are crucial concerns. 
    Doctors will work alongside AI systems to provide better patient care.`,

    `Hello and welcome to this business presentation. 
    Our company has achieved significant growth this quarter. 
    Sales have increased by 25% compared to the same period last year. 
    Customer satisfaction ratings have also improved. 
    We attribute this success to our innovative products and excellent customer service. 
    Looking ahead, we plan to expand into new markets and develop additional features.`
  ];

  // 随机选择一个样本或组合多个样本
  const randomTranscript = sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];
  
  console.log(`模拟转录完成，文本长度: ${randomTranscript.length}`);
  return randomTranscript;
}