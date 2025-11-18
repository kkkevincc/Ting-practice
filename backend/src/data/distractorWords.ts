/**
 * 干扰词词库
 * 包含约500个常用英语单词，用于生成听力练习的干扰选项
 * 这些词覆盖了日常交流、学术、商务等多个领域
 */

export const DISTRACTOR_WORDS: string[] = [
  // 基础常用词 (50个)
  'welcome', 'today', 'good', 'very', 'important', 'thing', 'place', 'people',
  'time', 'way', 'day', 'year', 'work', 'part', 'number', 'system', 'program',
  'question', 'problem', 'issue', 'situation', 'example', 'case', 'group',
  'country', 'world', 'family', 'house', 'home', 'room', 'area', 'level',
  'kind', 'type', 'form', 'policy', 'news', 'money', 'market', 'business',
  'study', 'research', 'information', 'data', 'result', 'fact', 'idea',
  'plan', 'project', 'service', 'activity',

  // 动词 (80个)
  'process', 'product', 'quality', 'experience', 'skill', 'knowledge', 'learning',
  'education', 'training', 'society', 'culture', 'health', 'environment',
  'technology', 'science', 'history', 'future', 'present', 'past', 'change',
  'develop', 'increase', 'decrease', 'improve', 'reduce', 'create', 'provide',
  'support', 'help', 'show', 'find', 'make', 'take', 'give', 'tell', 'come',
  'think', 'know', 'want', 'need', 'seem', 'feel', 'become', 'leave', 'move',
  'start', 'stop', 'continue', 'begin', 'end', 'finish', 'complete', 'open',
  'close', 'turn', 'go', 'get', 'put', 'set', 'run', 'walk', 'talk', 'speak',
  'say', 'ask', 'answer', 'listen', 'hear', 'see', 'look', 'watch', 'read',
  'write', 'draw', 'paint', 'build', 'break', 'fix', 'repair', 'clean',

  // 学术和教育 (60个)
  'academic', 'university', 'college', 'school', 'student', 'teacher', 'professor',
  'class', 'course', 'lesson', 'lecture', 'seminar', 'workshop', 'tutorial',
  'assignment', 'homework', 'exam', 'test', 'quiz', 'grade', 'score', 'mark',
  'degree', 'diploma', 'certificate', 'scholarship', 'tuition', 'fee', 'cost',
  'price', 'value', 'worth', 'benefit', 'advantage', 'disadvantage', 'pro',
  'con', 'method', 'approach', 'technique', 'strategy', 'tactic', 'solution',
  'analysis', 'synthesis', 'evaluation', 'comparison', 'contrast', 'summary',
  'conclusion', 'introduction', 'paragraph', 'sentence', 'word', 'vocabulary',
  'grammar', 'syntax', 'pronunciation', 'accent', 'dialect', 'language',

  // 商务和经济 (70个)
  'company', 'corporation', 'organization', 'enterprise', 'firm', 'office',
  'department', 'division', 'team', 'staff', 'employee', 'employer', 'manager',
  'director', 'executive', 'president', 'ceo', 'boss', 'leader', 'colleague',
  'client', 'customer', 'consumer', 'partner', 'supplier', 'vendor', 'contract',
  'agreement', 'deal', 'transaction', 'trade', 'commerce', 'industry', 'sector',
  'field', 'domain', 'revenue', 'income', 'profit', 'loss', 'expense', 'budget',
  'investment', 'capital', 'fund', 'loan', 'debt', 'credit', 'payment', 'bill',
  'invoice', 'receipt', 'account', 'balance', 'statement', 'report', 'meeting',
  'conference', 'presentation', 'proposal', 'offer', 'request', 'demand',
  'supply', 'stock', 'share', 'market', 'economy', 'economic', 'financial',

  // 科技和互联网 (60个)
  'computer', 'laptop', 'desktop', 'tablet', 'phone', 'mobile', 'device',
  'software', 'hardware', 'application', 'app', 'program', 'code', 'coding',
  'programming', 'developer', 'engineer', 'designer', 'user', 'interface',
  'website', 'webpage', 'internet', 'network', 'connection', 'online', 'offline',
  'digital', 'electronic', 'virtual', 'artificial', 'intelligence', 'machine',
  'robot', 'automation', 'database', 'server', 'cloud', 'storage', 'file',
  'folder', 'document', 'email', 'message', 'chat', 'social', 'media', 'platform',
  'system', 'operating', 'browser', 'search', 'engine', 'algorithm', 'data',
  'information', 'security', 'privacy', 'password', 'account', 'login',

  // 日常生活 (80个)
  'morning', 'afternoon', 'evening', 'night', 'week', 'month', 'season',
  'spring', 'summer', 'autumn', 'winter', 'weather', 'temperature', 'rain',
  'snow', 'wind', 'sun', 'cloud', 'sky', 'moon', 'star', 'earth', 'world',
  'city', 'town', 'village', 'street', 'road', 'building', 'apartment',
  'restaurant', 'cafe', 'shop', 'store', 'mall', 'supermarket', 'bank',
  'hospital', 'clinic', 'pharmacy', 'school', 'library', 'museum', 'park',
  'beach', 'mountain', 'river', 'lake', 'ocean', 'island', 'country',
  'food', 'meal', 'breakfast', 'lunch', 'dinner', 'snack', 'drink', 'water',
  'coffee', 'tea', 'juice', 'milk', 'bread', 'rice', 'meat', 'fish', 'fruit',
  'vegetable', 'salad', 'soup', 'pizza', 'burger', 'sandwich', 'cake',

  // 交通和旅行 (50个)
  'travel', 'trip', 'journey', 'vacation', 'holiday', 'tour', 'tourist',
  'hotel', 'resort', 'airport', 'station', 'train', 'bus', 'taxi', 'car',
  'vehicle', 'bicycle', 'bike', 'motorcycle', 'plane', 'airplane', 'flight',
  'ticket', 'passport', 'visa', 'luggage', 'bag', 'suitcase', 'backpack',
  'map', 'guide', 'direction', 'north', 'south', 'east', 'west', 'left',
  'right', 'straight', 'turn', 'corner', 'traffic', 'light', 'signal',
  'parking', 'garage', 'highway', 'bridge', 'tunnel', 'port', 'harbor',

  // 情感和性格 (40个)
  'happy', 'sad', 'angry', 'excited', 'nervous', 'worried', 'anxious',
  'calm', 'relaxed', 'tired', 'sleepy', 'energetic', 'active', 'lazy',
  'busy', 'free', 'available', 'unavailable', 'confident', 'shy', 'brave',
  'afraid', 'scared', 'surprised', 'shocked', 'amazed', 'impressed',
  'disappointed', 'satisfied', 'pleased', 'grateful', 'thankful', 'proud',
  'ashamed', 'embarrassed', 'guilty', 'innocent', 'honest', 'dishonest',

  // 身体和健康 (50个)
  'body', 'head', 'face', 'eye', 'ear', 'nose', 'mouth', 'tooth', 'teeth',
  'hair', 'hand', 'finger', 'arm', 'leg', 'foot', 'feet', 'shoulder', 'knee',
  'back', 'chest', 'stomach', 'heart', 'brain', 'blood', 'bone', 'muscle',
  'skin', 'health', 'healthy', 'sick', 'ill', 'disease', 'illness', 'pain',
  'ache', 'fever', 'cough', 'cold', 'flu', 'medicine', 'drug', 'pill',
  'doctor', 'nurse', 'patient', 'treatment', 'therapy', 'exercise', 'sport',
  'fitness', 'gym', 'yoga',

  // 颜色和描述 (30个)
  'color', 'colour', 'red', 'blue', 'green', 'yellow', 'orange', 'purple',
  'pink', 'brown', 'black', 'white', 'gray', 'grey', 'big', 'small', 'large',
  'tiny', 'huge', 'enormous', 'long', 'short', 'tall', 'high', 'low', 'wide',
  'narrow', 'thick', 'thin', 'heavy', 'light',

  // 时间和频率 (30个)
  'always', 'usually', 'often', 'sometimes', 'rarely', 'never', 'once',
  'twice', 'again', 'already', 'yet', 'still', 'just', 'now', 'then', 'soon',
  'later', 'early', 'late', 'before', 'after', 'during', 'while', 'when',
  'until', 'since', 'ago', 'recently', 'recent', 'ancient', 'modern',

  // 数量和程度 (30个)
  'many', 'much', 'more', 'most', 'few', 'little', 'less', 'least', 'some',
  'any', 'all', 'every', 'each', 'both', 'either', 'neither', 'none',
  'several', 'various', 'different', 'same', 'similar', 'equal', 'enough',
  'too', 'very', 'quite', 'rather', 'pretty', 'extremely', 'absolutely',

  // 位置和方向 (30个)
  'here', 'there', 'where', 'everywhere', 'nowhere', 'somewhere', 'anywhere',
  'inside', 'outside', 'within', 'without', 'above', 'below', 'over', 'under',
  'up', 'down', 'top', 'bottom', 'front', 'back', 'side', 'middle', 'center',
  'edge', 'corner', 'end', 'beginning', 'start', 'finish',

  // 关系和社交 (40个)
  'friend', 'friendship', 'enemy', 'stranger', 'neighbor', 'guest', 'host',
  'parent', 'father', 'mother', 'dad', 'mom', 'son', 'daughter', 'brother',
  'sister', 'uncle', 'aunt', 'cousin', 'grandfather', 'grandmother', 'grandpa',
  'grandma', 'husband', 'wife', 'spouse', 'partner', 'boyfriend', 'girlfriend',
  'relationship', 'marriage', 'wedding', 'divorce', 'love', 'hate', 'like',
  'dislike', 'respect', 'trust', 'betray', 'forgive'
];

/**
 * 获取随机干扰词
 * @param count 需要的干扰词数量
 * @param excludeWords 需要排除的单词列表（通常是关键词）
 * @returns 随机选择的干扰词数组
 */
export function getRandomDistractors(count: number, excludeWords: string[] = []): string[] {
  const excludeSet = new Set(excludeWords.map(w => w.toLowerCase()));
  const availableWords = DISTRACTOR_WORDS.filter(
    word => !excludeSet.has(word.toLowerCase())
  );
  
  // 随机打乱并选择
  const shuffled = [...availableWords].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, availableWords.length));
}

