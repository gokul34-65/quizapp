// src/services/api.js
const API_BASE_URL = 'http://localhost:8080/api';

// Auth API calls
export const authAPI = {
  register: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    
    return response.json();
  },

  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    
    return response.json();
  },
};

// Quiz API calls
export const quizAPI = {
  generateQuestion: async (category) => {
    const response = await fetch(`${API_BASE_URL}/quiz/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ category }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate question');
    }
    
    return response.json();
  },
};

// Streak API calls
export const streakAPI = {
  saveStreak: async (userId, streakCount, category) => {
    const response = await fetch(`${API_BASE_URL}/streaks/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, streakCount, category }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save streak');
    }
    
    return response.json();
  },

  getUserStreakHistory: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/streaks/user/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch streak history');
    }
    
    return response.json();
  },

  getLeaderboard: async (limit = 10) => {
    const response = await fetch(`${API_BASE_URL}/streaks/leaderboard?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }
    
    return response.json();
  },

  getHighestStreak: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/streaks/highest/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch highest streak');
    }
    
    return response.json();
  },
};