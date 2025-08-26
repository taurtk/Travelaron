import axios from 'axios';

// Use local proxy in development, direct URL in production
const API_URL = import.meta.env.DEV ? '/api' : 'http://ec2-13-223-49-221.compute-1.amazonaws.com:8080/api';

const api = axios.create({
  baseURL: API_URL,
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
  const url = `${API_URL}${endpoint}`;
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