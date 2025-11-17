import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export interface ExerciseOption {
  id: number;
  text: string;
  isKeyword: boolean;
  clicked: boolean;
  isCorrect: boolean;
}

export async function extractKeywords(transcript: string, questions: string = ''): Promise<string[]> {
  try {
    console.log('使用本地方法提取关键词');
    // 使用基于频率的本地关键词提取方法
    const keywords = extractKeywordsFallback(transcript);
    console.log(`提取到 ${keywords.length} 个关键词`);
    return keywords;
  } catch (error: any) {
    console.error('关键词提取错误:', error);
    return [];
  }
}

// 生成练习选项：关键词 + 干扰词
export function generateExerciseOptions(keywords: string[], transcript: string, totalOptions: number = 100): ExerciseOption[] {
  // 常见干扰词列表（高频但不太重要的词汇）
  const commonDistractors = [
    'welcome', 'today', 'good', 'very', 'important', 'thing', 'place', 'people', 
    'time', 'way', 'day', 'year', 'work', 'part', 'number', 'system', 'program',
    'question', 'problem', 'issue', 'situation', 'example', 'case', 'group',
    'country', 'world', 'family', 'house', 'home', 'room', 'area', 'level',
    'kind', 'type', 'form', 'policy', 'news', 'money', 'market', 'business',
    'study', 'research', 'information', 'data', 'result', 'fact', 'idea',
    'plan', 'project', 'service', 'activity', 'process', 'product', 'quality',
    'experience', 'skill', 'knowledge', 'learning', 'education', 'training',
    'society', 'culture', 'health', 'environment', 'technology', 'science',
    'history', 'future', 'present', 'past', 'change', 'develop', 'increase',
    'decrease', 'improve', 'reduce', 'create', 'provide', 'support', 'help',
    'show', 'find', 'make', 'take', 'give', 'tell', 'come', 'think', 'know',
    'want', 'need', 'seem', 'feel', 'become', 'leave', 'move', 'start', 'stop'
  ];

  // 获取原文中的所有单词作为上下文干扰词
  const transcriptWords = transcript
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && word.length < 12) // 合理长度的单词
    .filter(word => !keywords.includes(word)) // 排除关键词
    .filter((word, index, self) => self.indexOf(word) === index); // 去重

  // 创建干扰词池：40%来自原文，60%来自通用词库
  const contextDistractorCount = Math.floor((totalOptions - keywords.length) * 0.4);
  const commonDistractorCount = totalOptions - keywords.length - contextDistractorCount;

  // 从原文中随机选择干扰词
  const shuffledTranscriptWords = transcriptWords.sort(() => Math.random() - 0.5);
  const contextDistractors = shuffledTranscriptWords.slice(0, contextDistractorCount);

  // 从通用词库中随机选择干扰词
  const shuffledCommonWords = commonDistractors.sort(() => Math.random() - 0.5);
  const commonSelectedDistractors = shuffledCommonWords.slice(0, commonDistractorCount);

  // 合并所有词汇
  const allWords = [
    ...keywords,
    ...contextDistractors,
    ...commonSelectedDistractors
  ];
  
  // 完全随机打乱
  const shuffledWords = allWords.sort(() => Math.random() - 0.5);
  
  // 生成选项对象
  const options: ExerciseOption[] = shuffledWords.map((word, index) => ({
    id: index,
    text: word,
    isKeyword: keywords.includes(word),
    clicked: false,
    isCorrect: false
  }));
  
  return options;
}

// 后备方法：基于词频提取关键词
function extractKeywordsFallback(transcript: string): string[] {
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

  // 返回出现频率较高的单词（至少出现2次，或按频率排序取前50个）
  return Array.from(wordFreq.entries())
    .filter(([word, freq]) => freq >= 2 || word.length > 5) // 长单词或高频词
    .sort((a, b) => {
      // 优先按频率，其次按长度
      if (b[1] !== a[1]) return b[1] - a[1];
      return b[0].length - a[0].length;
    })
    .slice(0, 50)
    .map(([word]) => word);
}
