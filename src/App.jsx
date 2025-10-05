import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Zap, LogOut, User, TrendingUp, X } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api';

const categories = [
  { name: "Technical", icon: "💻" },
  { name: "Historical", icon: "📜" },
  { name: "Science", icon: "🔬" },
  { name: "Sports", icon: "⚽" },
  { name: "Geography", icon: "🌍" },
  { name: "Entertainment", icon: "🎬" },
  { name: "Literature", icon: "📚" },
  { name: "Mathematics", icon: "🔢" }
];

export default function QuizApp() {
  const [screen, setScreen] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [highestStreak, setHighestStreak] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [questionLoaded, setQuestionLoaded] = useState(false);

  // Timer effect - only runs when question is loaded and displayed
  useEffect(() => {
    if (screen === 'quiz' && !gameOver && !showResult && currentQuestion && questionLoaded) {
      if (timeLeft > 0) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        handleTimeout();
      }
    }
  }, [timeLeft, screen, gameOver, showResult, currentQuestion, questionLoaded]);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }
      
      const data = await response.json();
      setCurrentUser(data);
      setHighestStreak(data.highestStreak);
      setScreen('categories');
      
      await loadLeaderboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }
      
      const data = await response.json();
      setCurrentUser(data);
      setHighestStreak(data.highestStreak);
      setScreen('categories');
      
      await loadLeaderboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/streaks/leaderboard?limit=10`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    }
  };

  const loadQuestion = async (category) => {
    setLoading(true);
    setQuestionLoaded(false);
    try {
      const response = await fetch(`${API_BASE_URL}/quiz/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate question');
      }
      
      const question = await response.json();
      setCurrentQuestion(question);
      setTimeLeft(20); // Reset timer when question is loaded
      setQuestionLoaded(true); // Mark question as loaded to start timer
    } catch (err) {
      setError('Failed to load question. Using fallback.');
      setCurrentQuestion({
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctIndex: 1,
        category: category
      });
      setTimeLeft(20);
      setQuestionLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    setStreak(0);
    setTimeLeft(20);
    setGameOver(false);
    setShowResult(false);
    setSelectedAnswer(null);
    setQuestionLoaded(false);
    setScreen('quiz');
    await loadQuestion(category);
  };

  const saveStreakToBackend = async (finalStreak) => {
    try {
      const response = await fetch(`${API_BASE_URL}/streaks/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          streakCount: finalStreak,
          category: selectedCategory
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.isNewRecord) {
          setHighestStreak(data.highestStreak);
        }
        await loadLeaderboard();
      }
    } catch (err) {
      console.error('Failed to save streak:', err);
    }
  };

  const handleAnswerSelect = async (answerIndex) => {
    if (showResult || !currentQuestion) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    setQuestionLoaded(false); // Stop timer when answer is selected

    if (answerIndex === currentQuestion.correctIndex) {
      setTimeout(async () => {
        const newStreak = streak + 1;
        setStreak(newStreak);
        setSelectedAnswer(null);
        setShowResult(false);
        await loadQuestion(selectedCategory);
      }, 1500);
    } else {
      setTimeout(async () => {
        await saveStreakToBackend(streak);
        setGameOver(true);
      }, 1500);
    }
  };

  const handleTimeout = async () => {
    setQuestionLoaded(false);
    await saveStreakToBackend(streak);
    setGameOver(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUsername('');
    setPassword('');
    setScreen('login');
  };

  const restartQuiz = () => {
    setScreen('categories');
    setSelectedCategory(null);
    setCurrentQuestion(null);
    setStreak(0);
    setTimeLeft(20);
    setGameOver(false);
    setShowResult(false);
    setSelectedAnswer(null);
    setQuestionLoaded(false);
  };

  if (screen === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
          <div className="text-center mb-6 sm:mb-8">
            <Trophy className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-yellow-500 mb-3 sm:mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Quiz Master</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">Test your knowledge, break records!</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                placeholder="Enter username (min 3 chars)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                placeholder="Enter password (min 6 chars)"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 text-base"
            >
              {loading ? 'Loading...' : 'Login'}
            </button>
          </div>

          <div className="mt-4 sm:mt-6">
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-gray-200 text-gray-800 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50 text-base"
            >
              {loading ? 'Loading...' : 'Create New Account'}
            </button>
          </div>

          <p className="text-xs sm:text-sm text-gray-500 text-center mt-4">
            Backend: {API_BASE_URL}
          </p>
        </div>
      </div>
    );
  }

  if (screen === 'categories') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header with user info */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl px-4 py-3 sm:px-6 sm:py-3 shadow-lg w-full sm:w-auto">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                <span className="font-semibold text-gray-800 text-sm sm:text-base">{currentUser.username}</span>
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1 text-center sm:text-left">
                Highest Streak: <span className="font-bold text-purple-600">{highestStreak}</span>
              </div>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowLeaderboard(true)}
                className="flex-1 sm:flex-none bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Leaderboard</span>
                <span className="sm:hidden">Rankings</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 sm:flex-none bg-white text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4">Choose Your Challenge</h1>
            <p className="text-base sm:text-xl text-white opacity-90">Select a category to start your streak</p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => handleCategorySelect(category.name)}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl hover:shadow-2xl hover:scale-105 transition transform"
              >
                <div className="text-4xl sm:text-5xl lg:text-6xl mb-2 sm:mb-3 lg:mb-4">{category.icon}</div>
                <h3 className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-800">{category.name}</h3>
              </button>
            ))}
          </div>

          {/* Leaderboard Modal */}
          {showLeaderboard && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Leaderboard</h2>
                  </div>
                  <button
                    onClick={() => setShowLeaderboard(false)}
                    className="text-gray-500 hover:text-gray-700 p-1"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                
                {leaderboard.length > 0 ? (
                  <div className="space-y-2">
                    {leaderboard.map((entry, index) => (
                      <div 
                        key={index} 
                        className={`flex justify-between items-center p-3 sm:p-4 rounded-lg ${
                          index === 0 ? 'bg-yellow-100' : 
                          index === 1 ? 'bg-gray-100' : 
                          index === 2 ? 'bg-orange-100' : 
                          'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className={`text-lg sm:text-2xl font-bold ${
                            index === 0 ? 'text-yellow-600' :
                            index === 1 ? 'text-gray-600' :
                            index === 2 ? 'text-orange-600' :
                            'text-purple-600'
                          }`}>
                            #{index + 1}
                          </span>
                          <span className="font-semibold text-gray-800 text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">
                            {entry.username}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <span className="text-base sm:text-lg font-bold text-gray-700">{entry.highestStreak}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No records yet. Be the first!</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (screen === 'quiz') {
    if (gameOver) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-400 via-orange-400 to-yellow-400 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-12 max-w-lg w-full text-center">
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">😢</div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">Game Over!</h1>
            <div className="mb-6 sm:mb-8">
              <div className="text-5xl sm:text-6xl font-bold text-orange-500 mb-2">{streak}</div>
              <p className="text-lg sm:text-xl text-gray-600">Final Streak</p>
            </div>
            {streak >= highestStreak && streak > 0 && (
              <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-base sm:text-lg font-semibold text-yellow-800">🎉 New Record!</p>
              </div>
            )}
            <div className="bg-gray-100 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-gray-600">All-Time Best</p>
              <p className="text-2xl sm:text-3xl font-bold text-purple-600">{highestStreak}</p>
            </div>
            <button
              onClick={restartQuiz}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:from-purple-600 hover:to-pink-600 transition"
            >
              Try Another Category
            </button>
          </div>
        </div>
      );
    }

    if (!currentQuestion || loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 flex items-center justify-center p-4">
          <div className="text-white text-xl sm:text-2xl font-bold text-center">Loading question...</div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 p-4 sm:p-6 flex items-center">
        <div className="max-w-4xl mx-auto w-full">
          {/* Stats Header */}
          <div className="flex justify-between items-center gap-2 sm:gap-4 mb-4 sm:mb-8">
            <div className="bg-white rounded-lg sm:rounded-xl px-3 py-2 sm:px-6 sm:py-3 shadow-lg flex items-center gap-2 flex-1">
              <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-500 flex-shrink-0" />
              <div>
                <div className="text-xs sm:text-sm text-gray-600">Streak</div>
                <div className="text-xl sm:text-3xl font-bold text-purple-600">{streak}</div>
              </div>
            </div>

            <div className={`bg-white rounded-lg sm:rounded-xl px-3 py-2 sm:px-6 sm:py-3 shadow-lg flex items-center gap-2 flex-1 ${timeLeft <= 5 ? 'animate-pulse' : ''}`}>
              <Clock className={`w-4 h-4 sm:w-6 sm:h-6 flex-shrink-0 ${timeLeft <= 5 ? 'text-red-500' : 'text-blue-500'}`} />
              <div>
                <div className="text-xs sm:text-sm text-gray-600">Time</div>
                <div className={`text-xl sm:text-3xl font-bold ${timeLeft <= 5 ? 'text-red-500' : 'text-blue-600'}`}>
                  {timeLeft}s
                </div>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
            <div className="mb-4 sm:mb-6">
              <span className="bg-purple-100 text-purple-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                {selectedCategory}
              </span>
            </div>

            <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 lg:mb-8 break-words">
              {currentQuestion.question}
            </h2>

            <div className="grid grid-cols-1 gap-2 sm:gap-3 lg:gap-4">
              {currentQuestion.options.map((option, index) => {
                let buttonClass = "w-full text-left p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base lg:text-lg transition transform active:scale-95 break-words ";
                
                if (showResult) {
                  if (index === currentQuestion.correctIndex) {
                    buttonClass += "bg-green-500 text-white";
                  } else if (index === selectedAnswer) {
                    buttonClass += "bg-red-500 text-white";
                  } else {
                    buttonClass += "bg-gray-100 text-gray-400";
                  }
                } else {
                  buttonClass += "bg-gray-100 hover:bg-purple-100 text-gray-800 active:bg-purple-200";
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    className={buttonClass}
                  >
                    <span className="mr-2 sm:mr-3 font-bold">{String.fromCharCode(65 + index)}.</span>
                    <span className="break-words">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exit Button */}
          <button
            onClick={restartQuiz}
            className="w-full bg-red-500 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-red-600 transition text-sm sm:text-base flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
            Exit Quiz
          </button>
        </div>
      </div>
    );
  }
}