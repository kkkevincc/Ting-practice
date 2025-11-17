import { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import PracticeArea from './components/PracticeArea';
import QuestionsDisplay from './components/QuestionsDisplay';
import AudioPlayer from './components/AudioPlayer';
import api from './services/api';

interface SessionData {
  id: string;
  audioUrl: string;
  questions: string;
  transcript: string | null;
  keywords: string[] | null;
  status: 'processing' | 'completed' | 'error';
  created_at?: string;
}

function App() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [words, setWords] = useState<Array<{ id: number; text: string; clicked: boolean }>>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // 默认深色模式
  const [userStats, setUserStats] = useState({ totalSessions: 0, totalTime: 0, accuracy: 0 });

  const handleUploadSuccess = (uploadResponse: SessionData) => {
    setSession(uploadResponse);
    console.log('上传成功，会话ID:', uploadResponse.id);
    setUserStats(prev => ({
      ...prev,
      totalSessions: prev.totalSessions + 1
    }));
  };

  useEffect(() => {
    if (!session?.id) return;
    
    const pollSession = async () => {
      try {
        const res = await api.get(`/session/${session.id}`);
        const data = res.data;
        setSession(data);
        
        if (data.status === 'completed') {
          const wordsRes = await api.get(`/session/${session.id}/words`);
          const wordsData = wordsRes.data;
          setWords(wordsData.words);
          setKeywords(wordsData.keywords || []);
        }
      } catch (error) {
        console.error('获取会话状态失败:', error);
      }
    };

    const interval = setInterval(pollSession, 2000);
    pollSession();

    return () => clearInterval(interval);
  }, [session?.id]);

  const handleWordClick = (wordId: number) => {
    setWords(prevWords =>
      prevWords.map(word =>
        word.id === wordId ? { ...word, clicked: !word.clicked } : word
      )
    );
  };

  const handlePracticeComplete = (results: any) => {
    console.log('练习完成:', results);
    if (results.accuracy !== undefined) {
      setUserStats(prev => ({
        ...prev,
        accuracy: prev.accuracy > 0 ? (prev.accuracy + results.accuracy) / 2 : results.accuracy
      }));
    }
    setShowTranscript(true);
  };

  const resetSession = () => {
    setSession(null);
    setWords([]);
    setKeywords([]);
    setShowTranscript(false);
  };

  const getThemeClasses = () => {
    return isDarkMode 
      ? 'bg-[#0A0A0B] text-white'
      : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 text-gray-900';
  };

  const getCardClasses = () => {
    return isDarkMode 
      ? 'bg-[#18181B]/80 border-gray-800/50 hover:border-gray-700/50 backdrop-blur-sm'
      : 'bg-white/90 border-gray-200 hover:border-gray-300 backdrop-blur-sm';
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${getThemeClasses()}`}>
      {/* Enhanced Navigation */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300 ${
        isDarkMode ? 'border-gray-800/50 bg-[#0A0A0B]/80' : 'border-gray-200/50 bg-white/80'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' 
                    : 'bg-gradient-to-br from-blue-500 to-blue-600'
                }`}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full animate-pulse border-2 ${
                  isDarkMode ? 'bg-emerald-500 border-gray-900' : 'bg-green-500 border-white'
                }`}></div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  智能听力训练
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  AI驱动的个性化英语听力学习平台
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {userStats.totalSessions > 0 && (
                <div className="hidden md:flex items-center space-x-4">
                  <div className={`px-4 py-2 rounded-xl border ${getCardClasses()}`}>
                    <div className="text-sm font-medium">已完成</div>
                    <div className="text-lg font-bold text-blue-600">{userStats.totalSessions}</div>
                  </div>
                  {userStats.accuracy > 0 && (
                    <div className={`px-4 py-2 rounded-xl border ${getCardClasses()}`}>
                      <div className="text-sm font-medium">准确率</div>
                      <div className="text-lg font-bold text-green-600">{Math.round(userStats.accuracy)}%</div>
                    </div>
                  )}
                </div>
              )}
              
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-xl transition-all duration-200 hover:scale-110 ${
                  isDarkMode 
                    ? 'bg-gray-800/50 text-yellow-400 hover:bg-gray-700/50 border border-gray-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="切换主题"
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                  </svg>
                )}
              </button>
              
              <div className={`px-4 py-2 rounded-full text-sm font-medium border ${
                isDarkMode 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-green-50 text-green-600 border-green-200'
              }`}>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    isDarkMode ? 'bg-emerald-400' : 'bg-green-500'
                  }`}></div>
                  <span>AI智能</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {!session ? (
          <div className="animate-fade-in-up">
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in-up">
            {session.status === 'processing' && (
              <div className={`rounded-3xl p-8 text-center border-2 border-dashed transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-[#18181B]/60 border-emerald-500/20' 
                  : 'bg-gradient-to-br from-blue-50 to-blue-50 border-blue-200'
              }`}>
                <div className="relative mb-6">
                  <div className="relative mx-auto w-20 h-20">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 animate-pulse"></div>
                    <div className="absolute inset-1 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-500 border-t-transparent"></div>
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-bounce flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3">
                  AI正在处理您的音频
                </h3>
                <p className={`text-lg mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  智能转录音频并提取关键词，打造个性化学习体验
                </p>
                <div className="flex justify-center space-x-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    ></div>
                  ))}
                </div>
                <div className="mt-6 flex justify-center">
                  <div className="w-48 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}

            {session.status === 'completed' && (
              <>
                {/* 返回主页按钮 */}
                <div className="flex justify-between items-center mb-6">
                  <button
                    onClick={resetSession}
                    className={`group relative overflow-hidden px-6 py-3 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-gray-700 to-gray-800 border-gray-600 text-gray-200 hover:border-gray-500 hover:shadow-xl' 
                        : 'bg-gradient-to-r from-gray-50 to-white border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-xl'
                    }`}
                  >
                    <div className="relative flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
                      </svg>
                      <span className="font-semibold">返回主页</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 to-purple-500/0 group-hover:from-blue-400/10 group-hover:to-purple-500/10 transition-all duration-300"></div>
                  </button>
                  
                  <div className={`px-4 py-2 rounded-full text-sm font-medium border ${
                    isDarkMode 
                      ? 'bg-green-900/30 text-green-400 border-green-700/50' 
                      : 'bg-green-50 text-green-600 border-green-200'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>AI处理完成</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                  <div className="xl:col-span-3 space-y-6">
                    <div className={`rounded-3xl border transition-all duration-300 hover:shadow-2xl ${getCardClasses()} p-8`}>
                      <AudioPlayer audioUrl={session.audioUrl} title="听力音频练习" />
                      
                      {showTranscript && session.transcript && (
                        <div className={`rounded-2xl border mt-6 p-6 ${
                          isDarkMode 
                            ? 'bg-gray-700/50 border-gray-600' 
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center mb-6">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                              isDarkMode ? 'bg-green-900/30' : 'bg-green-50'
                            }`}>
                              <svg className={`w-5 h-5 ${
                                isDarkMode ? 'text-green-400' : 'text-green-600'
                              }`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                              </svg>
                            </div>
                            <h2 className="text-xl font-bold">
                              智能转录文本
                            </h2>
                            <div className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
                              isDarkMode 
                                ? 'bg-green-900/30 text-green-400' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              AI生成
                            </div>
                          </div>
                          <div className={`rounded-xl p-6 ${
                            isDarkMode 
                              ? 'bg-gray-800/50 text-gray-300' 
                              : 'bg-white text-gray-700'
                          } leading-relaxed whitespace-pre-wrap shadow-inner`}>
                            {session.transcript}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {session.questions && session.questions.trim().length > 0 && (
                      <div className={`rounded-3xl border transition-all duration-300 hover:shadow-lg ${getCardClasses()} p-6`}>
                        <QuestionsDisplay questions={session.questions} />
                      </div>
                    )}
                    
                    {session.transcript && (
                      <div className={`rounded-3xl border transition-all duration-300 hover:shadow-lg ${getCardClasses()} p-6`}>
                        <div className="flex items-center mb-6">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                            isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
                          }`}>
                            <svg className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold">
                            完整音频转写
                          </h3>
                        </div>
                        <div className={`prose prose-lg max-w-none p-6 rounded-xl ${
                          isDarkMode 
                            ? 'bg-gray-800/50 text-gray-300' 
                            : 'bg-gray-50 text-gray-700'
                        } leading-relaxed shadow-inner`}>
                          {session.transcript}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="xl:col-span-1">
                    <div className={`rounded-3xl border p-6 sticky top-24 transition-all duration-300 hover:shadow-lg ${getCardClasses()}`}>
                      <div className="flex items-center mb-6">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                          isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'
                        }`}>
                          <svg className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        </div>
                        <h2 className="text-xl font-bold">
                          关键词提取
                        </h2>
                      </div>
                      
                      {keywords.length > 0 ? (
                        <div className="space-y-3">
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            点击词汇练习
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {keywords.map((keyword, index) => (
                              <span
                                key={index}
                                className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border cursor-pointer transition-all duration-200 hover:scale-105 ${
                                  isDarkMode 
                                    ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 text-blue-300 border-blue-700/50 hover:border-blue-600/50' 
                                    : 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 hover:border-blue-300 hover:shadow-md'
                                }`}
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                          }`}>
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent"></div>
                          </div>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            正在提取关键词...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`rounded-3xl border p-8 transition-all duration-300 hover:shadow-lg ${getCardClasses()}`}>
                  <div className="flex items-center mb-6">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                      isDarkMode ? 'bg-orange-900/30' : 'bg-orange-50'
                    }`}>
                      <svg className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold">
                      互动练习区
                    </h2>
                  </div>
                  <PracticeArea 
                    sessionId={session.id} 
                    onWordClick={handleWordClick}
                    onPracticeComplete={handlePracticeComplete}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={resetSession}
                    className={`group relative overflow-hidden px-8 py-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-gray-700 to-gray-800 border-gray-600 text-gray-200 hover:border-gray-500 hover:shadow-xl' 
                        : 'bg-gradient-to-r from-gray-50 to-white border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-xl'
                    }`}
                  >
                    <div className="relative flex items-center space-x-3">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                      </svg>
                      <span className="font-semibold">开始新练习</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 to-purple-500/0 group-hover:from-blue-400/10 group-hover:to-purple-500/10 transition-all duration-300"></div>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <footer className="mt-16 py-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center text-gray-500 text-sm">
            <p>由AI技术驱动的英语听力练习平台</p>
            <p className="mt-1">支持多种音频格式 • 智能关键词提取 • 精准听力训练</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;