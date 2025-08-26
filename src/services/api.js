import axios from 'axios';

// Use local proxy in development, direct URL in production
const API_URL = import.meta.env.DEV ? '/api' : 'http://ec2-13-223-49-221.compute-1.amazonaws.com:8080/api';

// For development, we'll use the proxy. For production, we need to handle HTTPS/HTTP issues
const getApiUrl = () => {
  console.log('Environment check:', {
    isDev: import.meta.env.DEV,
    mode: import.meta.env.MODE,
    protocol: typeof window !== 'undefined' ? window.location.protocol : 'unknown',
    envApiUrl: import.meta.env.VITE_API_URL
  });
  
  if (import.meta.env.DEV) {
    console.log('Using development proxy: /api');
    return '/api';
  }
  
  // Use environment variable if available
  if (import.meta.env.VITE_API_URL) {
    console.log('Using environment API URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // In production, check if we're on HTTPS and adjust accordingly
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    // If your site is HTTPS but API is HTTP, you'll need a proxy or HTTPS API
    console.warn('HTTPS site trying to access HTTP API - this may be blocked by browser');
    return 'http://ec2-13-223-49-221.compute-1.amazonaws.com:8080/api';
  }
  
  console.log('Using fallback production API URL');
  return 'http://ec2-13-223-49-221.compute-1.amazonaws.com:8080/api';
};

const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
  console.log('API Request:', request.method?.toUpperCase(), request.url);
  return request;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Helper function for fetch requests
export const fetchAPI = async (endpoint, options = {}) => {
  const url = `${getApiUrl()}${endpoint}`;
  console.log('Fetch API Request:', options.method || 'GET', url);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch API Error:', error.message);
    throw error;
  }
};

export default api;