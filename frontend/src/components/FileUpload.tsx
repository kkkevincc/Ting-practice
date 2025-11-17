import React, { useState } from 'react';
import api from '../services/api';

interface FileUploadProps {
  onUploadSuccess: (sessionId: string) => void;
}

interface UploadState {
  audioFile: File | null;
  questionsFile: File | null;
  isUploading: boolean;
  progress: number;
  error: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    audioFile: null,
    questionsFile: null,
    isUploading: false,
    progress: 0,
    error: null,
  });

  const handleAudioFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadState(prev => ({
        ...prev,
        audioFile: file,
        error: null,
      }));
    }
  };

  const handleQuestionsFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadState(prev => ({
        ...prev,
        questionsFile: file,
        error: null,
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!uploadState.audioFile) {
      setUploadState(prev => ({ ...prev, error: '请选择音频文件' }));
      return;
    }

    setUploadState(prev => ({ 
      ...prev, 
      isUploading: true, 
      progress: 0, 
      error: null 
    }));

    try {
      const formData = new FormData();
      formData.append('audio', uploadState.audioFile);
      if (uploadState.questionsFile) {
        formData.append('questions', uploadState.questionsFile);
      }

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5分钟超时
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            setUploadState(prev => ({ ...prev, progress }));
          }
        },
      });

      setUploadState(prev => ({ ...prev, progress: 100 }));
      setTimeout(() => {
        onUploadSuccess(response.data); // 传递完整的响应对象
      }, 500);

    } catch (error: any) {
      setUploadState(prev => ({ 
        ...prev, 
        isUploading: false, 
        error: error.response?.data?.error || error.message || '上传失败，请重试' 
      }));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <div className="container mx-auto px-6 py-12">
        {/* Enhanced Hero Section */}
        <div className="text-center mb-16">
          <div className="relative inline-block mb-8">
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>
            <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/20">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            AI英语听力训练
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-4 max-w-3xl mx-auto leading-relaxed">
            基于最新AI技术的智能听力训练平台，个性化学习体验助您快速提升英语听力水平
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
            <span className="inline-flex items-center px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              智能转录
            </span>
            <span className="inline-flex items-center px-4 py-2 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-full">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              关键词提取
            </span>
            <span className="inline-flex items-center px-4 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              互动练习
            </span>
          </div>
        </div>

        {/* Enhanced Upload Card */}
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative bg-[#18181B]/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-800/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5"></div>
              
              <div className="relative p-12">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    上传您的音频文件
                  </h2>
                  <p className="text-lg text-gray-400">
                    支持多种音频格式，我们的AI将为您提供智能分析和练习
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Enhanced Audio Upload */}
                  <div className="space-y-4">
                    <label className="block text-lg font-semibold text-white">
                      音频文件 <span className="text-red-400">*</span>
                    </label>
                    <div className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 ${
                      uploadState.audioFile 
                        ? 'border-emerald-500/50 bg-emerald-500/5' 
                        : 'border-gray-700 hover:border-emerald-500/30 bg-gray-900/20'
                    }`}>
                      <div className="p-8">
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleAudioFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={uploadState.isUploading}
                        />
                        <div className="text-center">
                          {uploadState.audioFile ? (
                            <div className="space-y-4">
                              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                </svg>
                              </div>
                              <div>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {uploadState.audioFile.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatFileSize(uploadState.audioFile.size)}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"/>
                                </svg>
                              </div>
                              <div>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                  点击或拖拽音频文件到此处
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  支持 MP3、WAV、M4A 等格式，最大 100MB
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Questions Upload */}
                  <div className="space-y-4">
                    <label className="block text-lg font-semibold text-white">
                      题目文件 <span className="text-gray-500">(可选)</span>
                    </label>
                    <div className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 ${
                      uploadState.questionsFile 
                        ? 'border-teal-500/50 bg-teal-500/5' 
                        : 'border-gray-700 hover:border-teal-500/30 bg-gray-900/20'
                    }`}>
                      <div className="p-8">
                        <input
                          type="file"
                          accept=".json,.txt,.md"
                          onChange={handleQuestionsFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={uploadState.isUploading}
                        />
                        <div className="text-center">
                          {uploadState.questionsFile ? (
                            <div className="space-y-4">
                              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                                </svg>
                              </div>
                              <div>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {uploadState.questionsFile.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatFileSize(uploadState.questionsFile.size)}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                                </svg>
                              </div>
                              <div>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                  点击上传题目文件
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  支持 JSON、TXT、MD 格式，可包含练习题目
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Error Display */}
                  {uploadState.error && (
                    <div className="rounded-2xl p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mr-4">
                          <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-red-800 dark:text-red-200">上传错误</h4>
                          <p className="text-red-700 dark:text-red-300">{uploadState.error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Progress Display */}
                  {uploadState.isUploading && (
                    <div className="rounded-2xl p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200">正在上传文件</h4>
                              <p className="text-blue-700 dark:text-blue-300">AI正在准备您的个性化学习内容</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                              {uploadState.progress}%
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${uploadState.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Submit Button */}
                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={!uploadState.audioFile || uploadState.isUploading}
                      className={`w-full py-6 px-8 rounded-2xl font-bold text-xl transition-all duration-300 transform ${
                        !uploadState.audioFile || uploadState.isUploading
                          ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
                          : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-3">
                        {uploadState.isUploading ? (
                          <>
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                            <span>正在上传...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                            </svg>
                            <span>开始智能分析</span>
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Features Section */}
        <div className="mt-20 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              为什么选择我们的AI听力训练平台？
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              先进的AI技术，为您提供个性化的学习体验
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">精准语音识别</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                基于最新语音识别技术，精确转录音频内容，支持多种口音和语速
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">智能关键词提取</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                AI算法自动识别和提取音频中的关键词汇，帮助您快速掌握重点内容
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">个性化练习</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                根据您的音频内容生成个性化练习题和混淆选项，让学习更高效
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;