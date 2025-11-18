import { useState, useEffect } from 'react';
import api from '../services/api';

interface PracticeRecord {
  id: number;
  session_id: string;
  accuracy: number;
  total_words: number;
  time_spent: number;
  created_at: string;
  clicked_words: string[];
}

interface HistoryViewProps {
  isDarkMode?: boolean;
  onClose: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ isDarkMode = true, onClose }) => {
  const [records, setRecords] = useState<PracticeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/practice/records');
      setRecords(response.data.records);
    } catch (err: any) {
      setError(err.message || '获取历史记录失败');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}秒`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${remainingSeconds}秒`;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return isDarkMode ? 'text-green-400' : 'text-green-600';
    if (accuracy >= 70) return isDarkMode ? 'text-blue-400' : 'text-blue-600';
    if (accuracy >= 50) return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
    return isDarkMode ? 'text-red-400' : 'text-red-600';
  };

  const getAccuracyBgColor = (accuracy: number) => {
    if (accuracy >= 90) return isDarkMode ? 'bg-green-900/20 border-green-700/30' : 'bg-green-50 border-green-200';
    if (accuracy >= 70) return isDarkMode ? 'bg-blue-900/20 border-blue-700/30' : 'bg-blue-50 border-blue-200';
    if (accuracy >= 50) return isDarkMode ? 'bg-yellow-900/20 border-yellow-700/30' : 'bg-yellow-50 border-yellow-200';
    return isDarkMode ? 'bg-red-900/20 border-red-700/30' : 'bg-red-50 border-red-200';
  };

  // 计算统计信息
  const stats = {
    total: records.length,
    avgAccuracy: records.length > 0 
      ? Math.round(records.reduce((sum, r) => sum + r.accuracy, 0) / records.length)
      : 0,
    totalTime: records.reduce((sum, r) => sum + r.time_spent, 0),
    bestScore: records.length > 0 ? Math.max(...records.map(r => r.accuracy)) : 0
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${isDarkMode ? 'bg-black/80' : 'bg-gray-900/50'} backdrop-blur-sm`}>
      <div className="min-h-screen px-4 py-8">
        <div className={`max-w-5xl mx-auto rounded-3xl shadow-2xl overflow-hidden ${
          isDarkMode ? 'bg-[#18181B]' : 'bg-white'
        }`}>
          {/* Header */}
          <div className={`p-6 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600' 
                    : 'bg-gradient-to-br from-blue-500 to-purple-600'
                }`}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    练习历史记录
                  </h2>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    查看您的历史练习成绩和进步
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition-all duration-200 hover:scale-110 ${
                  isDarkMode 
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          {records.length > 0 && (
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-800 bg-gray-900/20' : 'border-gray-200 bg-gray-50'}`}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-2xl border ${
                  isDarkMode ? 'bg-[#18181B] border-gray-800' : 'bg-white border-gray-200'
                }`}>
                  <div className={`text-3xl font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {stats.total}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    总练习次数
                  </div>
                </div>
                <div className={`p-4 rounded-2xl border ${
                  isDarkMode ? 'bg-[#18181B] border-gray-800' : 'bg-white border-gray-200'
                }`}>
                  <div className={`text-3xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {stats.avgAccuracy}%
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    平均准确率
                  </div>
                </div>
                <div className={`p-4 rounded-2xl border ${
                  isDarkMode ? 'bg-[#18181B] border-gray-800' : 'bg-white border-gray-200'
                }`}>
                  <div className={`text-3xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    {stats.bestScore}%
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    最高分数
                  </div>
                </div>
                <div className={`p-4 rounded-2xl border ${
                  isDarkMode ? 'bg-[#18181B] border-gray-800' : 'bg-white border-gray-200'
                }`}>
                  <div className={`text-3xl font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                    {Math.floor(stats.totalTime / 60)}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    总练习时长(分钟)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>加载中...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <svg className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                  加载失败
                </p>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{error}</p>
                <button
                  onClick={fetchHistory}
                  className={`mt-4 px-4 py-2 rounded-lg ${
                    isDarkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  重试
                </button>
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-12">
                <svg className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  暂无练习记录
                </p>
                <p className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                  完成一次练习后，记录会显示在这里
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {records.map((record, index) => (
                  <div
                    key={record.id}
                    className={`p-5 rounded-2xl border transition-all duration-200 hover:scale-[1.02] ${
                      isDarkMode 
                        ? 'bg-gray-900/50 border-gray-800 hover:border-gray-700' 
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        {/* Index Badge */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          index < 3 
                            ? isDarkMode 
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' 
                              : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                            : isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>

                        {/* Record Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {formatDate(record.created_at)}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {record.total_words} 个单词
                            </span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              用时: {formatTime(record.time_spent)}
                            </span>
                          </div>
                        </div>

                        {/* Accuracy Badge */}
                        <div className={`px-4 py-2 rounded-xl border ${getAccuracyBgColor(record.accuracy)}`}>
                          <div className={`text-2xl font-bold ${getAccuracyColor(record.accuracy)}`}>
                            {Math.round(record.accuracy)}%
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                            准确率
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryView;

