import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface Word {
  id: number;
  text: string;
  clicked: boolean;
}

interface ExerciseOption {
  word: string;
  isCorrect: boolean;
}

interface ExerciseData {
  options: ExerciseOption[];
  transcript: string;
  keywords: string[];
  status: string;
}

interface PracticeAreaProps {
  sessionId: string;
  onWordClick: (wordId: number) => void;
  onPracticeComplete: (results: any) => void;
}

const PracticeArea: React.FC<PracticeAreaProps> = ({ sessionId, onWordClick, onPracticeComplete }) => {
  const [exerciseData, setExerciseData] = useState<ExerciseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Set<string>>(new Set());
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetchExerciseData();
  }, [sessionId]);

  const fetchExerciseData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/session/${sessionId}/exercise`);
      setExerciseData(response.data);
    } catch (err) {
      setError('获取练习数据失败');
      console.error('Error fetching exercise data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (word: string, isCorrect: boolean) => {
    const newSelectedAnswers = new Set(selectedAnswers);
    if (selectedAnswers.has(word)) {
      newSelectedAnswers.delete(word);
    } else {
      newSelectedAnswers.add(word);
    }
    setSelectedAnswers(newSelectedAnswers);
  };

  const handleSubmit = () => {
    if (!exerciseData) return;
    
    const results = exerciseData.options.map(option => ({
      word: option.word,
      userAnswered: selectedAnswers.has(option.word),
      isCorrect: option.isCorrect
    }));
    
    const correctAnswers = exerciseData.options.filter(option => option.isCorrect).length;
    const userCorrectAnswers = results.filter(r => r.userAnswered && r.isCorrect).length;
    const accuracy = correctAnswers > 0 ? (userCorrectAnswers / correctAnswers) * 100 : 0;
    
    setShowResults(true);
    onPracticeComplete({
      results,
      accuracy,
      totalQuestions: exerciseData.options.length,
      correctAnswers: userCorrectAnswers
    });
  };

  const handleReset = () => {
    setSelectedAnswers(new Set());
    setShowResults(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm hover:shadow-md transition-all duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">加载练习数据中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm hover:shadow-md transition-all duration-300">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">加载失败</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchExerciseData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          重新加载
        </button>
      </div>
    );
  }

  if (!exerciseData || exerciseData.status === 'processing') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm hover:shadow-md transition-all duration-300">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-50 rounded-full mb-6">
          <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">听力练习区域</h3>
        <p className="text-gray-600">正在等待音频处理完成...</p>
      </div>
    );
  }

  if (exerciseData.status === 'no_keywords') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm hover:shadow-md transition-all duration-300">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-50 to-yellow-50 rounded-full mb-6">
          <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">无法生成练习</h3>
        <p className="text-gray-600">未提取到足够的关键词，请检查音频内容或重新上传</p>
      </div>
    );
  }

  const correctCount = exerciseData.options.filter(option => option.isCorrect).length;
  const progress = selectedAnswers.size / correctCount * 100;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">听力练习</h2>
            <p className="text-sm text-gray-600">选择听到的关键词，验证你的听力理解</p>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center space-x-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{selectedAnswers.size}</div>
            <div className="text-xs text-gray-500">已选择 / 正确答案数: {correctCount}</div>
          </div>
          <div className="w-16 h-16 relative">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgb(229, 231, 235)"
                strokeWidth="2"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgb(59, 130, 246)"
                strokeWidth="2"
                strokeDasharray={`${Math.min(progress, 100)}, 100`}
                className="transition-all duration-300 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold text-blue-600">
                {Math.round(Math.min(progress, 100))}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Progress */}
      <div className="sm:hidden mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">练习进度</span>
          <span className="text-sm font-semibold text-gray-900">{selectedAnswers.size} / {correctCount}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Exercise Options */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mb-8">
        {exerciseData.options.map((option, index) => {
          const isSelected = selectedAnswers.has(option.word);
          const isCorrect = option.isCorrect;
          const showResult = showResults;
          
          let buttonClass = 'group relative px-4 py-3 rounded-xl border-2 transition-all duration-200 ease-out font-medium text-sm md:text-base focus:outline-none focus:ring-4 focus:ring-opacity-50 transform hover:scale-105 active:scale-95 ';
          
          if (showResult) {
            if (isCorrect && isSelected) {
              buttonClass += 'bg-green-100 border-green-500 text-green-800';
            } else if (!isCorrect && isSelected) {
              buttonClass += 'bg-red-100 border-red-500 text-red-800';
            } else if (isCorrect && !isSelected) {
              buttonClass += 'bg-yellow-100 border-yellow-500 text-yellow-800';
            } else {
              buttonClass += 'bg-gray-100 border-gray-300 text-gray-600';
            }
          } else {
            if (isSelected) {
              buttonClass += 'bg-blue-500 text-white border-blue-500 shadow-lg';
            } else {
              buttonClass += 'bg-white text-gray-900 border-gray-200 hover:border-blue-300 hover:shadow-md';
            }
          }
          
          return (
            <button
              key={index}
              onClick={() => !showResult && handleOptionClick(option.word, option.isCorrect)}
              disabled={showResult}
              className={buttonClass}
            >
              <span className="relative z-10">{option.word}</span>
              
              {!showResult && isSelected && (
                <div className="absolute top-1 right-1">
                  <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              )}
              
              {showResult && isCorrect && isSelected && (
                <div className="absolute top-1 right-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              )}
              
              {showResult && !isCorrect && isSelected && (
                <div className="absolute top-1 right-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              )}
              
              {showResult && isCorrect && !isSelected && (
                <div className="absolute top-1 right-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Results Summary */}
      {showResults && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">练习结果</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {exerciseData.options.filter((opt, idx) => opt.isCorrect && selectedAnswers.has(opt.word)).length}
              </div>
              <div className="text-gray-600">正确</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {exerciseData.options.filter((opt, idx) => !opt.isCorrect && selectedAnswers.has(opt.word)).length}
              </div>
              <div className="text-gray-600">错误</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {exerciseData.options.filter((opt, idx) => opt.isCorrect && !selectedAnswers.has(opt.word)).length}
              </div>
              <div className="text-gray-600">遗漏</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {exerciseData.options.filter((opt, idx) => !opt.isCorrect && !selectedAnswers.has(opt.word)).length}
              </div>
              <div className="text-gray-600">未选择</div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>已选择: {selectedAnswers.size}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>正确答案: {correctCount}</span>
          </div>
        </div>
        
        <div className="flex space-x-3">
          {!showResults ? (
            <button
              onClick={handleSubmit}
              disabled={selectedAnswers.size === 0}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              提交答案
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
              </svg>
              重新练习
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeArea;