import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Zap, LogOut, User } from 'lucide-react';

const quizData = {
  Technical: [
    { question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language"], correct: 0 },
    { question: "Which language is known as the 'language of the web'?", options: ["Python", "Java", "JavaScript", "C++"], correct: 2 },
    { question: "What does CSS stand for?", options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style Sheets", "Colorful Style Sheets"], correct: 1 },
    { question: "Which company developed React?", options: ["Google", "Microsoft", "Facebook", "Amazon"], correct: 2 }
  ],
  Historical: [
    { question: "In which year did World War II end?", options: ["1943", "1944", "1945", "1946"], correct: 2 },
    { question: "Who was the first President of the United States?", options: ["Thomas Jefferson", "George Washington", "John Adams", "Benjamin Franklin"], correct: 1 },
    { question: "The Great Wall of China was built during which dynasty primarily?", options: ["Ming Dynasty", "Tang Dynasty", "Han Dynasty", "Qing Dynasty"], correct: 0 },
    { question: "Who discovered America in 1492?", options: ["Vasco da Gama", "Ferdinand Magellan", "Christopher Columbus", "Marco Polo"], correct: 2 }
  ],
  Science: [
    { question: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], correct: 2 },
    { question: "How many planets are in our solar system?", options: ["7", "8", "9", "10"], correct: 1 },
    { question: "What is the speed of light?", options: ["300,000 km/s", "150,000 km/s", "450,000 km/s", "600,000 km/s"], correct: 0 },
    { question: "What gas do plants absorb?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correct: 2 }
  ],
  Sports: [
    { question: "How many players are on a soccer team?", options: ["9", "10", "11", "12"], correct: 2 },
    { question: "In which sport would you perform a slam dunk?", options: ["Volleyball", "Basketball", "Tennis", "Baseball"], correct: 1 },
    { question: "How many rings are on the Olympic flag?", options: ["4", "5", "6", "7"], correct: 1 },
    { question: "In which country were the first modern Olympics held?", options: ["France", "Greece", "Italy", "England"], correct: 1 }
  ],
  Geography: [
    { question: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], correct: 2 },
    { question: "Which is the largest ocean?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3 },
    { question: "What is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], correct: 1 },
    { question: "How many continents are there?", options: ["5", "6", "7", "8"], correct: 2 }
  ],
  Entertainment: [
    { question: "Who directed the movie Inception?", options: ["Steven Spielberg", "Christopher Nolan", "James Cameron", "Martin Scorsese"], correct: 1 },
    { question: "Which movie won Oscar for Best Picture in 2020?", options: ["1917", "Joker", "Parasite", "Once Upon a Time"], correct: 2 },
    { question: "Who played Iron Man in Marvel movies?", options: ["Chris Evans", "Robert Downey Jr", "Chris Hemsworth", "Mark Ruffalo"], correct: 1 },
    { question: "Which service created Stranger Things?", options: ["Hulu", "Amazon Prime", "Netflix", "Disney Plus"], correct: 2 }
  ],
  Literature: [
    { question: "Who wrote Romeo and Juliet?", options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], correct: 1 },
    { question: "What is the first Harry Potter book?", options: ["Chamber of Secrets", "Prisoner of Azkaban", "Philosopher Stone", "Goblet of Fire"], correct: 2 },
    { question: "Who wrote 1984?", options: ["George Orwell", "Aldous Huxley", "Ray Bradbury", "H G Wells"], correct: 0 },
    { question: "Who wrote Pride and Prejudice?", options: ["Emily Bronte", "Charlotte Bronte", "Jane Austen", "Mary Shelley"], correct: 2 }
  ],
  Mathematics: [
    { question: "What is the value of Pi to two decimal places?", options: ["3.12", "3.14", "3.16", "3.18"], correct: 1 },
    { question: "What is 15 percent of 200?", options: ["25", "30", "35", "40"], correct: 1 },
    { question: "What is the square root of 144?", options: ["10", "11", "12", "13"], correct: 2 },
    { question: "How many sides does a hexagon have?", options: ["5", "6", "7", "8"], correct: 1 }
  ]
};

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
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [highestStreak, setHighestStreak] = useState(0);
  const [users, setUsers] = useState([
    { username: 'demo', password: 'demo123', highestStreak: 15 }
  ]);

  useEffect(() => {
    if (screen === 'quiz' && !gameOver && !showResult) {
      if (timeLeft > 0) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        handleTimeout();
      }
    }
  }, [timeLeft, screen, gameOver, showResult]);

  const handleLogin = () => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      setHighestStreak(user.highestStreak);
      setScreen('categories');
    } else {
      alert('Invalid credentials! Try demo / demo123');
    }
  };

  const handleRegister = () => {
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      alert('Username already exists!');
    } else if (username.length < 3 || password.length < 6) {
      alert('Username must be 3+ chars, password 6+ chars');
    } else {
      const newUser = { username, password, highestStreak: 0 };
      setUsers([...users, newUser]);
      setCurrentUser(newUser);
      setHighestStreak(0);
      setScreen('categories');
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentQuestion(0);
    setStreak(0);
    setTimeLeft(20);
    setGameOver(false);
    setShowResult(false);
    setSelectedAnswer(null);
    setScreen('quiz');
  };

  const handleAnswerSelect = (answerIndex) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const currentQ = quizData[selectedCategory][currentQuestion % quizData[selectedCategory].length];
    
    if (answerIndex === currentQ.correct) {
      setTimeout(() => {
        setStreak(streak + 1);
        setCurrentQuestion(currentQuestion + 1);
        setTimeLeft(20);
        setSelectedAnswer(null);
        setShowResult(false);
      }, 1500);
    } else {
      setTimeout(() => {
        setGameOver(true);
        if (streak > highestStreak) {
          setHighestStreak(streak);
          const updatedUsers = users.map(u => 
            u.username === currentUser.username ? { ...u, highestStreak: streak } : u
          );
          setUsers(updatedUsers);
        }
      }, 1500);
    }
  };

  const handleTimeout = () => {
    setGameOver(true);
    if (streak > highestStreak) {
      setHighestStreak(streak);
    }
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
    setCurrentQuestion(0);
    setStreak(0);
    setTimeLeft(20);
    setGameOver(false);
    setShowResult(false);
    setSelectedAnswer(null);
  };

  if (screen === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">Quiz Master</h1>
            <p className="text-gray-600 mt-2">Test your knowledge, break records!</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter password"
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              Login
            </button>
          </div>

          <div className="mt-6">
            <button
              onClick={handleRegister}
              className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Create New Account
            </button>
          </div>

          <p className="text-sm text-gray-500 text-center mt-4">
            Demo: username demo, password demo123
          </p>
        </div>
      </div>
    );
  }

  if (screen === 'categories') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="bg-white rounded-xl px-6 py-3 shadow-lg">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-gray-800">{currentUser.username}</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Highest Streak: <span className="font-bold text-purple-600">{highestStreak}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">Choose Your Challenge</h1>
            <p className="text-xl text-white opacity-90">Select a category to start your streak</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => handleCategorySelect(category.name)}
                className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:scale-105 transition transform"
              >
                <div className="text-6xl mb-4">{category.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800">{category.name}</h3>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'quiz') {
    const currentQ = quizData[selectedCategory][currentQuestion % quizData[selectedCategory].length];

    if (gameOver) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-400 via-orange-400 to-yellow-400 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-lg w-full text-center">
            <div className="text-6xl mb-4">😢</div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Game Over!</h1>
            <div className="mb-8">
              <div className="text-6xl font-bold text-orange-500 mb-2">{streak}</div>
              <p className="text-xl text-gray-600">Final Streak</p>
            </div>
            {streak > highestStreak && (
              <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 mb-6">
                <p className="text-lg font-semibold text-yellow-800">🎉 New Record!</p>
              </div>
            )}
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">All-Time Best</p>
              <p className="text-3xl font-bold text-purple-600">{highestStreak}</p>
            </div>
            <button
              onClick={restartQuiz}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-lg font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition"
            >
              Try Another Category
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="bg-white rounded-xl px-6 py-3 shadow-lg flex items-center gap-3">
              <Zap className="w-6 h-6 text-yellow-500" />
              <div>
                <div className="text-sm text-gray-600">Current Streak</div>
                <div className="text-3xl font-bold text-purple-600">{streak}</div>
              </div>
            </div>

            <div className={`bg-white rounded-xl px-6 py-3 shadow-lg flex items-center gap-3 ${timeLeft <= 5 ? 'animate-pulse' : ''}`}>
              <Clock className={`w-6 h-6 ${timeLeft <= 5 ? 'text-red-500' : 'text-blue-500'}`} />
              <div>
                <div className="text-sm text-gray-600">Time Left</div>
                <div className={`text-3xl font-bold ${timeLeft <= 5 ? 'text-red-500' : 'text-blue-600'}`}>
                  {timeLeft}s
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
            <div className="mb-6">
              <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">
                {selectedCategory}
              </span>
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              {currentQ.question}
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {currentQ.options.map((option, index) => {
                let buttonClass = "w-full text-left p-6 rounded-xl font-semibold text-lg transition transform hover:scale-102 ";
                
                if (showResult) {
                  if (index === currentQ.correct) {
                    buttonClass += "bg-green-500 text-white";
                  } else if (index === selectedAnswer) {
                    buttonClass += "bg-red-500 text-white";
                  } else {
                    buttonClass += "bg-gray-100 text-gray-400";
                  }
                } else {
                  buttonClass += "bg-gray-100 hover:bg-purple-100 text-gray-800";
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    className={buttonClass}
                  >
                    <span className="mr-3 font-bold">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={restartQuiz}
            className="w-full bg-white text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }
}