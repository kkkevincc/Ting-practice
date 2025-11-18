import dotenv from 'dotenv';
import { getRandomDistractors } from '../data/distractorWords.js';

dotenv.config();

export interface ExerciseOption {
  id: number;
  text: string;
  isKeyword: boolean;
  clicked: boolean;
  isCorrect: boolean;
  timeSegment?: number; // 时间段索引（0-based），用于时间轴显示
}

export async function extractKeywords(transcript: string, questions: string = '', audioDurationSeconds?: number): Promise<string[]> {
  try {
    // 如果配置了AI API，尝试使用AI智能筛选
    // 使用独立的AI API密钥（区别于音频转写API）
    if (process.env.USE_AI_KEYWORD_FILTER === 'true' && process.env.AI_API_KEY) {
      try {
        console.log('🤖 使用AI API智能筛选关键词...');
        const aiKeywords = await extractKeywordsWithAI(transcript, questions, audioDurationSeconds);
        if (aiKeywords && aiKeywords.length > 0) {
          console.log(`✅ AI筛选成功，提取到 ${aiKeywords.length} 个关键词`);
          return aiKeywords;
        }
        console.log('⚠️  AI筛选未返回结果，切换到本地方法');
      } catch (aiError: any) {
        console.log(`⚠️  AI筛选失败: ${aiError.message}，切换到本地方法`);
      }
    }
    
    console.log('使用本地方法提取关键词');
    
    // 计算目标关键词数量：每分钟15个
    let targetKeywordCount = 50; // 默认50个
    if (audioDurationSeconds) {
      const durationMinutes = audioDurationSeconds / 60;
      targetKeywordCount = Math.round(durationMinutes * 15);
      console.log(`音频时长: ${durationMinutes.toFixed(2)}分钟，目标提取: ${targetKeywordCount}个关键词`);
    }
    
    // 使用基于频率的本地关键词提取方法
    const keywords = extractKeywordsFallback(transcript, targetKeywordCount);
    console.log(`实际提取到 ${keywords.length} 个关键词`);
    return keywords;
  } catch (error: any) {
    console.error('关键词提取错误:', error);
    return [];
  }
}

/**
 * 使用AI API智能筛选关键词
 * 分析转写文本和题目，选择与听力解答最相关的关键词
 */
async function extractKeywordsWithAI(transcript: string, questions: string = '', audioDurationSeconds?: number): Promise<string[]> {
  try {
    const axios = (await import('axios')).default;
    
    // 计算目标关键词数量
    let targetKeywordCount = 50;
    if (audioDurationSeconds) {
      const durationMinutes = audioDurationSeconds / 60;
      targetKeywordCount = Math.round(durationMinutes * 15);
    }
    
    // 构建提示词
    const prompt = `你是一个英语听力教学专家。请从以下音频转写文本中，提取出${targetKeywordCount}个最关键的单词。

这些单词应该：
1. 与听力理解的核心内容相关
2. 如果提供了题目，优先选择与题目相关的关键词
3. 避免过于常见的功能词（如 the, a, is, are 等）
4. 选择对理解音频内容最有帮助的实词

音频转写文本：
${transcript.substring(0, 3000)}${transcript.length > 3000 ? '...' : ''}

${questions ? `相关题目：\n${questions.substring(0, 1000)}\n` : ''}

请只返回单词列表，每行一个单词，不要编号，不要解释。`;

    // 使用 agentrouter.org API 端点
    const apiUrl = process.env.AI_API_BASE_URL || 'https://agentrouter.org/v1/chat/completions';
    const apiKey = process.env.AI_API_KEY;
    const model = process.env.AI_API_MODEL || 'glm-4.6';

    console.log(`   📡 AI API端点: ${apiUrl}`);
    console.log(`   🤖 使用模型: ${model}`);
    console.log(`   🔑 API密钥: ${apiKey ? apiKey.substring(0, 10) + '...' : '未配置'}`);

    const response = await axios.post(
      apiUrl,
      {
        model: model,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的英语教学助手，擅长从文本中提取关键学习词汇。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0]?.message?.content || '';
    if (!content) {
      throw new Error('AI API未返回内容');
    }

    // 解析返回的单词列表
    const keywords = content
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0 && !line.match(/^\d+[\.\)]/)) // 移除编号
      .map((word: string) => word.toLowerCase().replace(/[^\w]/g, '')) // 清理标点
      .filter((word: string) => word.length > 2) // 至少3个字符
      .slice(0, targetKeywordCount); // 限制数量

    return keywords;
  } catch (error: any) {
    console.error('AI关键词提取错误:', error.message);
    throw error;
  }
}

// 生成练习选项：关键词 + 干扰词
// 每个正确词配约3个干扰词
// 如果提供了音频时长，会按时间段均匀分布正确答案
export function generateExerciseOptions(keywords: string[], transcript: string, totalOptions?: number, audioDurationSeconds?: number): ExerciseOption[] {
  // 计算需要的干扰词数量：每个关键词配3个干扰词
  const distractorsPerKeyword = 3;
  const totalDistractorsNeeded = keywords.length * distractorsPerKeyword;
  
  // 如果未指定总选项数，则根据关键词数量自动计算
  const calculatedTotalOptions = totalOptions || (keywords.length + totalDistractorsNeeded);
  
  console.log(`📊 关键词数量: ${keywords.length}，每个关键词配${distractorsPerKeyword}个干扰词`);
  console.log(`📊 需要干扰词: ${totalDistractorsNeeded}个，总选项: ${calculatedTotalOptions}个`);

  // 获取原文中的所有单词作为上下文干扰词（排除关键词）
  const transcriptWords = transcript
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && word.length < 12) // 合理长度的单词
    .filter(word => !keywords.includes(word.toLowerCase())) // 排除关键词
    .filter((word, index, self) => self.indexOf(word) === index); // 去重

  // 从干扰词库中获取随机干扰词
  const allExcludeWords = [...keywords, ...transcriptWords.slice(0, 50)]; // 排除关键词和部分原文词
  const libraryDistractors = getRandomDistractors(
    Math.min(totalDistractorsNeeded, 400), // 最多从词库取400个
    allExcludeWords
  );

  // 从原文中随机选择一些干扰词（作为上下文相关干扰词）
  const contextDistractorCount = Math.min(
    Math.floor(totalDistractorsNeeded * 0.3), // 30%来自原文
    transcriptWords.length
  );
  const shuffledTranscriptWords = [...transcriptWords].sort(() => Math.random() - 0.5);
  const contextDistractors = shuffledTranscriptWords.slice(0, contextDistractorCount);

  // 合并所有干扰词
  const allDistractors = [
    ...libraryDistractors,
    ...contextDistractors
  ];

  // 如果干扰词不够，从词库再补充
  if (allDistractors.length < totalDistractorsNeeded) {
    const additionalNeeded = totalDistractorsNeeded - allDistractors.length;
    const additionalExclude = [...keywords, ...allDistractors];
    const additionalDistractors = getRandomDistractors(additionalNeeded, additionalExclude);
    allDistractors.push(...additionalDistractors);
  }

  // 截取到需要的数量
  const finalDistractors = allDistractors.slice(0, totalDistractorsNeeded);

  // 如果提供了音频时长，按时间段均匀分布正确答案
  let keywordTimeSegments: Map<string, number> = new Map();
  if (audioDurationSeconds && audioDurationSeconds > 0) {
    // 改进的时间段划分：确保每个时间段都有合理数量的关键词
    // 目标：每个时间段约3-5个关键词，时间段长度约30-60秒
    const targetKeywordsPerSegment = 4; // 每个时间段目标关键词数
    const minSegmentDuration = 30; // 最小时间段长度（秒）
    const maxSegmentDuration = 60; // 最大时间段长度（秒）
    
    // 计算理想的时间段数量
    const idealNumSegments = Math.max(1, Math.ceil(keywords.length / targetKeywordsPerSegment));
    const idealSegmentDuration = audioDurationSeconds / idealNumSegments;
    
    // 确保时间段长度在合理范围内
    const segmentDuration = Math.max(
      minSegmentDuration,
      Math.min(maxSegmentDuration, Math.ceil(idealSegmentDuration))
    );
    const numSegments = Math.ceil(audioDurationSeconds / segmentDuration);
    
    // 将关键词均匀分配到各个时间段（使用更均匀的分配算法）
    const keywordsPerSegment = Math.ceil(keywords.length / numSegments);
    keywords.forEach((keyword, index) => {
      // 使用更均匀的分配：确保每个时间段都有关键词
      const segmentIndex = Math.min(
        Math.floor(index / keywordsPerSegment),
        numSegments - 1
      );
      keywordTimeSegments.set(keyword, segmentIndex);
    });
    
    console.log(`⏱️  音频时长: ${audioDurationSeconds.toFixed(2)}秒，分成${numSegments}个时间段，每段约${segmentDuration}秒`);
    console.log(`📊 关键词分布：每个时间段约${keywordsPerSegment}个关键词`);
  }

  // 合并所有词汇：关键词 + 干扰词
  const allWords = [
    ...keywords,
    ...finalDistractors
  ];
  
  // 改进的打乱算法：确保正确答案在时间轴上均匀分布
  // 1. 先将关键词按时间段分组
  const keywordsBySegment = new Map<number, string[]>();
  keywords.forEach(keyword => {
    const segment = keywordTimeSegments.get(keyword) ?? -1;
    if (!keywordsBySegment.has(segment)) {
      keywordsBySegment.set(segment, []);
    }
    keywordsBySegment.get(segment)!.push(keyword);
  });
  
  // 2. 将干扰词也分配到时间段（均匀分配，与关键词匹配）
  const distractorsBySegment = new Map<number, string[]>();
  if (audioDurationSeconds && audioDurationSeconds > 0 && keywordTimeSegments.size > 0) {
    // 计算时间段数量（与关键词时间段一致）
    const maxSegment = Math.max(...Array.from(keywordTimeSegments.values()));
    const numSegments = maxSegment + 1;
    
    // 将干扰词均匀分配到各个时间段
    const distractorsPerSegment = Math.ceil(finalDistractors.length / numSegments);
    finalDistractors.forEach((distractor, index) => {
      const segment = Math.min(
        Math.floor(index / distractorsPerSegment),
        numSegments - 1
      );
      if (!distractorsBySegment.has(segment)) {
        distractorsBySegment.set(segment, []);
      }
      distractorsBySegment.get(segment)!.push(distractor);
    });
  } else {
    // 没有时长信息，所有干扰词分配到-1（未分配）
    finalDistractors.forEach(distractor => {
      if (!distractorsBySegment.has(-1)) {
        distractorsBySegment.set(-1, []);
      }
      distractorsBySegment.get(-1)!.push(distractor);
    });
  }
  
  // 3. 按时间段交替插入关键词和干扰词，确保均匀分布
  const shuffledWords: string[] = [];
  const maxSegments = Math.max(
    ...Array.from(keywordsBySegment.keys()),
    ...Array.from(distractorsBySegment.keys()),
    -1
  ) + 1;
  
  if (maxSegments > 0 && audioDurationSeconds && audioDurationSeconds > 0) {
    // 按时间段组织
    for (let seg = 0; seg < maxSegments; seg++) {
      const segKeywords = keywordsBySegment.get(seg) || [];
      const segDistractors = distractorsBySegment.get(seg) || [];
      
      // 打乱当前时间段内的词
      const segWords = [...segKeywords, ...segDistractors].sort(() => Math.random() - 0.5);
      shuffledWords.push(...segWords);
    }
    
    // 添加未分配到时间段的词
    const unassignedKeywords = keywordsBySegment.get(-1) || [];
    const unassignedDistractors = distractorsBySegment.get(-1) || [];
    shuffledWords.push(...[...unassignedKeywords, ...unassignedDistractors].sort(() => Math.random() - 0.5));
  } else {
    // 如果没有时长信息，完全随机打乱
    shuffledWords.push(...allWords.sort(() => Math.random() - 0.5));
  }
  
  // 生成选项对象
  const options: ExerciseOption[] = shuffledWords.map((word, index) => ({
    id: index,
    text: word,
    isKeyword: keywords.includes(word),
    clicked: false,
    isCorrect: false,
    timeSegment: keywordTimeSegments.get(word) ?? (audioDurationSeconds && audioDurationSeconds > 0 
      ? Math.floor((index / shuffledWords.length) * Math.ceil(audioDurationSeconds / 30))
      : undefined)
  }));
  
  console.log(`✅ 生成完成：${keywords.length}个关键词 + ${finalDistractors.length}个干扰词 = ${options.length}个选项`);
  console.log(`📈 干扰词比例：${(finalDistractors.length / keywords.length).toFixed(2)}:1`);
  if (audioDurationSeconds && audioDurationSeconds > 0) {
    console.log(`⏱️  已按时间段均匀分布正确答案`);
  }
  
  return options;
}

// 后备方法：基于词频提取关键词
function extractKeywordsFallback(transcript: string, targetCount: number = 50): string[] {
  // 常见功能词列表（排除这些词）
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this',
    'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
    'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its',
    'our', 'their', 'what', 'which', 'who', 'whom', 'whose', 'where',
    'when', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
    'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
    'same', 'so', 'than', 'too', 'very', 'just', 'now'
  ]);

  const words = transcript
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => {
      // 只保留长度大于3且不在停用词列表中的单词
      return word.length > 3 && !stopWords.has(word);
    });

  const wordFreq = new Map<string, number>();
  words.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  });

  // 确保目标数量在合理范围内
  const maxKeywords = Math.min(targetCount, wordFreq.size);
  
  // 返回出现频率较高的单词
  return Array.from(wordFreq.entries())
    .filter(([word, freq]) => freq >= 2 || word.length > 5) // 长单词或高频词
    .sort((a, b) => {
      // 优先按频率，其次按长度
      if (b[1] !== a[1]) return b[1] - a[1];
      return b[0].length - a[0].length;
    })
    .slice(0, maxKeywords)
    .map(([word]) => word);
}
