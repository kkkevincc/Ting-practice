import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

interface VocabularyEntry {
  word: string;
  definition: string;
  category: string;
  frequency: string;
  level: string;
}

interface PracticeWord {
  word: string;
  definition: string;
  isFromText: boolean;
  position: number; // 原文中的位置
}

class VocabularyService {
  private vocabularyCache: VocabularyEntry[] | null = null;

  /**
   * 获取雅思词汇库
   */
  private async loadVocabulary(): Promise<VocabularyEntry[]> {
    if (this.vocabularyCache) {
      return this.vocabularyCache;
    }

    try {
      // 获取当前文件的目录路径（ES模块方式）
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const vocabularyPath = path.join(__dirname, '..', 'data', 'ielts-vocabulary.json');
      console.log('正在加载词汇库，路径:', vocabularyPath);
      
      const vocabularyData = fs.readFileSync(vocabularyPath, 'utf8');
      const parsedData = JSON.parse(vocabularyData);
      
      this.vocabularyCache = parsedData.ielts_vocabulary || [];
      console.log(`成功加载词汇库，共 ${this.vocabularyCache.length} 个单词`);
      return this.vocabularyCache;
    } catch (error) {
      console.error('加载雅思词汇库失败:', error);
      this.vocabularyCache = [];
      return [];
    }
  }

  /**
   * 生成练习词汇（包含原文词汇和混淆项）
   */
  async generatePracticeWords(
    textWords: string[], 
    targetTotalCount: number = 100,
    correctWordCount: number = 15
  ): Promise<PracticeWord[]> {
    const vocabulary = await this.loadVocabulary();
    const practiceWords: PracticeWord[] = [];

    // 1. 添加原文中的词汇（按出现顺序）
    const uniqueTextWords = [...new Set(textWords)]; // 去重但保持顺序
    const availableTextWords = uniqueTextWords.filter(word => 
      /^[a-zA-Z]+$/.test(word) && word.length > 2
    ).slice(0, correctWordCount);

    availableTextWords.forEach((word, index) => {
      const foundVocabulary = vocabulary.find(v => 
        v.word.toLowerCase() === word.toLowerCase()
      );
      
      practiceWords.push({
        word: foundVocabulary?.word || word,
        definition: foundVocabulary?.definition || '暂无定义',
        isFromText: true,
        position: textWords.indexOf(word)
      });
    });

    // 2. 从词汇库中随机选择混淆词汇
    const remainingSlots = targetTotalCount - practiceWords.length;
    if (remainingSlots > 0 && vocabulary.length > availableTextWords.length) {
      const availableVocabulary = vocabulary.filter(v => 
        !availableTextWords.some(w => 
          w.toLowerCase() === v.word.toLowerCase()
        )
      );

      // 随机打乱词汇顺序
      const shuffled = availableVocabulary.sort(() => Math.random() - 0.5);
      const selectedDistractors = shuffled.slice(0, remainingSlots);

      selectedDistractors.forEach(vocab => {
        practiceWords.push({
          word: vocab.word,
          definition: vocab.definition,
          isFromText: false,
          position: -1
        });
      });
    }

    // 3. 最终随机打乱所有练习词汇
    return practiceWords.sort(() => Math.random() - 0.5);
  }

  /**
   * 获取词汇统计信息
   */
  async getVocabularyStats(): Promise<{
    totalCount: number;
    categories: { [key: string]: number };
    levels: { [key: string]: number };
    frequencies: { [key: string]: number };
  }> {
    const vocabulary = await this.loadVocabulary();
    
    const stats = {
      totalCount: vocabulary.length,
      categories: {} as { [key: string]: number },
      levels: {} as { [key: string]: number },
      frequencies: {} as { [key: string]: number }
    };

    vocabulary.forEach(vocab => {
      // 统计类别
      stats.categories[vocab.category] = (stats.categories[vocab.category] || 0) + 1;
      
      // 统计级别
      stats.levels[vocab.level] = (stats.levels[vocab.level] || 0) + 1;
      
      // 统计频率
      stats.frequencies[vocab.frequency] = (stats.frequencies[vocab.frequency] || 0) + 1;
    });

    return stats;
  }

  /**
   * 根据类别和级别筛选词汇
   */
  async getVocabularyByFilters(
    category?: string,
    level?: string,
    frequency?: string,
    limit?: number
  ): Promise<VocabularyEntry[]> {
    const vocabulary = await this.loadVocabulary();
    let filtered = vocabulary;

    if (category) {
      filtered = filtered.filter(v => v.category === category);
    }
    if (level) {
      filtered = filtered.filter(v => v.level === level);
    }
    if (frequency) {
      filtered = filtered.filter(v => v.frequency === frequency);
    }

    if (limit) {
      filtered = filtered.slice(0, limit);
    }

    return filtered;
  }

  /**
   * 获取单词定义
   */
  async getWordDefinition(word: string): Promise<string | null> {
    const vocabulary = await this.loadVocabulary();
    const found = vocabulary.find(v => 
      v.word.toLowerCase() === word.toLowerCase()
    );
    
    return found ? found.definition : null;
  }

  /**
   * 检查是否为有效词汇
   */
  async isValidVocabularyWord(word: string): Promise<boolean> {
    const vocabulary = await this.loadVocabulary();
    return vocabulary.some(v => 
      v.word.toLowerCase() === word.toLowerCase()
    );
  }

  /**
   * 生成扩展词汇（基于相似度或主题）
   */
  async generateRelatedWords(
    seedWords: string[], 
    limit: number = 50
  ): Promise<VocabularyEntry[]> {
    const vocabulary = await this.loadVocabulary();
    const relatedWords: VocabularyEntry[] = [];
    const usedWords = new Set(seedWords.map(w => w.toLowerCase()));

    // 查找包含种子词的词汇
    seedWords.forEach(seed => {
      const related = vocabulary.filter(v => 
        v.word.toLowerCase().includes(seed.toLowerCase()) ||
        v.definition.toLowerCase().includes(seed.toLowerCase())
      ).slice(0, Math.ceil(limit / seedWords.length));
      
      relatedWords.push(...related);
    });

    // 如果还不够，添加随机词汇
    if (relatedWords.length < limit) {
      const remaining = limit - relatedWords.length;
      const unusedVocabulary = vocabulary.filter(v => 
        !usedWords.has(v.word.toLowerCase())
      );
      
      const randomWords = unusedVocabulary
        .sort(() => Math.random() - 0.5)
        .slice(0, remaining);
      
      relatedWords.push(...randomWords);
    }

    return relatedWords.slice(0, limit);
  }

  /**
   * 预加载词汇库到缓存
   */
  async preloadVocabulary(): Promise<void> {
    await this.loadVocabulary();
    console.log(`词汇库预加载完成，共 ${this.vocabularyCache?.length || 0} 个单词`);
  }
}

export default new VocabularyService();