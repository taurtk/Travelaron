import axios from 'axios';

// API configuration is handled by getApiUrl() function

// For development, we'll use the Vite proxy. For production on Vercel, use serverless proxy
// The API URL is now consistently handled by the proxy
const getApiUrl = () => '/api/proxy';

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