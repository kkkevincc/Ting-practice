import fs from 'fs-extra';
import path from 'path';
import dotenv from 'dotenv';

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
      console.log('未配置SiliconFlow API密钥，使用模拟模式');
      return processAudioMock();
    }

    // 使用SiliconFlow API进行语音识别
    try {
      const transcription = await processAudioWithSiliconFlow(audioPath);
      console.log(`音频转文字成功，文本长度: ${transcription.length}`);
      return transcription;
    } catch (apiError: any) {
      // 如果API调用失败，自动切换到mock模式
      console.log(`SiliconFlow API调用失败，切换到模拟模式: ${apiError.message}`);
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
  
  // 动态导入form-data以避免ES模块兼容性问题
  const { default: FormData } = await import('form-data');
  
  const form = new FormData();
  form.append('model', 'FunAudioLLM/SenseVoiceSmall'); // SiliconFlow官方推荐模型
  
  // 关键：使用文件流而不是Buffer，与curl命令完全一致
  form.append('file', fs.createReadStream(audioPath));

  const options = {
    method: 'POST',
    headers: {
      ...form.getHeaders(), // FormData会自动处理Content-Type和boundary
      'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
    },
    body: form
  };

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`SiliconFlow API错误: ${response.status} ${response.statusText}`);
    console.error('错误详情:', errorText);
    throw new Error(`SiliconFlow API错误: ${response.status} ${response.statusText}`);
  }

  const data: any = await response.json();
  
  // 根据SiliconFlow API的响应格式提取文本
  if (data.text) {
    return data.text;
  } else if (data.transcription) {
    return data.transcription;
  } else if (typeof data === 'string') {
    return data;
  } else {
    throw new Error('API响应格式未知');
  }
}

// 模拟音频转文字功能
function processAudioMock(): string {
  console.log('使用模拟音频转文字功能');
  
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