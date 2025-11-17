import { useEffect, useState } from 'react';
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
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">学习统计</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
          <div className="text-4xl font-bold text-blue-600 mb-2">{stats.total_sessions}</div>
          <div className="text-sm text-gray-600">会话总数</div>
        </div>

        <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
          <div className="text-4xl font-bold text-blue-600 mb-2">{stats.total_practices}</div>
          <div className="text-sm text-gray-600">练习次数</div>
        </div>

        <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {Math.round(stats.average_accuracy)}%
          </div>
          <div className="text-sm text-gray-600">平均准确率</div>
        </div>

        <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {Math.round(stats.total_time_spent / 60)}
          </div>
          <div className="text-sm text-gray-600">学习时长(分钟)</div>
        </div>
      </div>
    </div>
  );
}