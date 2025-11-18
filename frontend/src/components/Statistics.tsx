import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

interface Statistics {
  total_sessions: number;
  total_practices: number;
  average_accuracy: number;
  total_time_spent: number;
}

export default function Statistics() {
  const [stats, setStats] = useState<Statistics>({
    total_sessions: 0,
    total_practices: 0,
    average_accuracy: 0,
    total_time_spent: 0
  });
  const [loading, setLoading] = useState(true);
  const [isDarkMode] = useState(true); // 默认深色模式

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/statistics');
      setStats(response.data);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 mt-4">正在加载统计数据...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode ? 'bg-[#0A0A0B] text-white' : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 text-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>学习统计</h2>
          <Link
            to="/"
            className={`px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 ${
              isDarkMode 
                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/50' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            返回首页
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className={`rounded-2xl p-6 text-center shadow-lg border transition-all duration-300 hover:scale-105 ${
            isDarkMode 
              ? 'bg-[#18181B]/80 border-gray-800/50' 
              : 'bg-white border-gray-200'
          }`}>
            <div className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {stats.total_sessions}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>会话总数</div>
          </div>

          <div className={`rounded-2xl p-6 text-center shadow-lg border transition-all duration-300 hover:scale-105 ${
            isDarkMode 
              ? 'bg-[#18181B]/80 border-gray-800/50' 
              : 'bg-white border-gray-200'
          }`}>
            <div className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {stats.total_practices}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>练习次数</div>
          </div>

          <div className={`rounded-2xl p-6 text-center shadow-lg border transition-all duration-300 hover:scale-105 ${
            isDarkMode 
              ? 'bg-[#18181B]/80 border-gray-800/50' 
              : 'bg-white border-gray-200'
          }`}>
            <div className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
              {Math.round(stats.average_accuracy)}%
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>平均准确率</div>
          </div>

          <div className={`rounded-2xl p-6 text-center shadow-lg border transition-all duration-300 hover:scale-105 ${
            isDarkMode 
              ? 'bg-[#18181B]/80 border-gray-800/50' 
              : 'bg-white border-gray-200'
          }`}>
            <div className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              {Math.round(stats.total_time_spent / 60)}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>学习时长(分钟)</div>
          </div>
        </div>
      </div>
    </div>
  );
}