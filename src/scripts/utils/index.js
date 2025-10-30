import CONFIG from './config.js';

// Token Management
export const setToken = (token) => {
  localStorage.setItem(CONFIG.TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(CONFIG.TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(CONFIG.TOKEN_KEY);
};

// User Management
export const setUser = (user) => {
  localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem(CONFIG.USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const removeUser = () => {
  localStorage.removeItem(CONFIG.USER_KEY);
};

// Auth Check
export const isAuthenticated = () => {
  return !!getToken();
};

// Loading Overlay
export const showLoading = () => {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.remove('hidden');
};

export const hideLoading = () => {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.add('hidden');
};

// Show Alert
export const showAlert = (message, type = 'success') => {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  alertDiv.style.position = 'fixed';
  alertDiv.style.top = '20px';
  alertDiv.style.right = '20px';
  alertDiv.style.zIndex = '10000';
  alertDiv.style.minWidth = '300px';
  alertDiv.style.animation = 'slideIn 0.3s ease-out';
  
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    alertDiv.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => alertDiv.remove(), 300);
  }, 3000);
};

// Form Validation
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

// Format Date
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

// Debounce
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};