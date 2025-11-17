interface QuestionsDisplayProps {
  questions: string;
}

interface Question {
  text: string;
  translation?: string;
  options?: string[];
  correctAnswer?: number;
  explanation?: string;
}

export default function QuestionsDisplay({ questions }: QuestionsDisplayProps) {
  // 将字符串解析为题目对象数组
  const parseQuestions = (questionsText: string): Question[] => {
    if (!questionsText || questionsText.trim().length === 0) {
      return [];
    }

    // 简单的解析逻辑，按空行分割题目
    const questionBlocks = questionsText.split(/\n\s*\n/).filter(block => block.trim().length > 0);
    
    return questionBlocks.map((block, index) => {
      const lines = block.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      const question: Question = {
        text: lines[0] || `题目 ${index + 1}`,
        translation: undefined,
        options: undefined,
        correctAnswer: undefined,
        explanation: undefined
      };

      // 查找翻译、选项、解释等
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('翻译：') || line.startsWith('Translation:')) {
          question.translation = line.replace(/^(翻译|Translation)：?\s*/, '');
        } else if (line.match(/^[A-D][\.\)]\s/)) {
          if (!question.options) question.options = [];
          question.options.push(line.replace(/^[A-D][\.\)]\s*/, ''));
        } else if (line.startsWith('解释：') || line.startsWith('Explanation:')) {
          question.explanation = line.replace(/^(解释|Explanation)：?\s*/, '');
        } else if (line.match(/^答案[：:]\s*[A-D]/i)) {
          const answer = line.match(/[A-D]/i)?.[0];
          if (answer) {
            question.correctAnswer = answer.toUpperCase().charCodeAt(0) - 65;
          }
        }
      }

      return question;
    });
  };

  const parsedQuestions = parseQuestions(questions);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-3xl font-semibold text-gray-900 tracking-tight">题目列表</h3>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-600">{parsedQuestions.length} 个题目</span>
        </div>
      </div>

      <div className="space-y-6 max-h-96 overflow-y-auto">
        {parsedQuestions.map((question, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <span className="text-sm font-medium text-gray-600">
                  题目 {index + 1}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {question.options?.length || 0} 个选项
              </span>
            </div>

            <div className="mb-4">
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                {question.text}
              </h4>
              {question.translation && (
                <p className="text-sm text-gray-600 italic">
                  {question.translation}
                </p>
              )}
            </div>

            {question.options && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-900">选项：</h5>
                <div className="grid gap-2">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`flex items-center p-3 rounded-xl border-2 transition-all duration-200 ${
                        question.correctAnswer === optionIndex
                          ? 'border-green-400 bg-green-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs font-medium ${
                        question.correctAnswer === optionIndex
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {String.fromCharCode(65 + optionIndex)}
                      </div>
                      <span className={`text-sm ${
                        question.correctAnswer === optionIndex
                          ? 'text-green-700 font-medium'
                          : 'text-gray-700'
                      }`}>
                        {option}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {question.explanation && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h5 className="text-sm font-medium text-gray-900 mb-2">
                  解释：
                </h5>
                <p className="text-sm text-gray-700">
                  {question.explanation}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {parsedQuestions.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
          </div>
          <p className="text-gray-600">暂无题目数据</p>
        </div>
      )}
    </div>
  );
}