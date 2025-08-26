import axios from 'axios';

// API configuration is handled by getApiUrl() function

// For development, we'll use the Vite proxy. For production on Vercel, use serverless proxy
const getApiUrl = () => {
  console.log('Environment check:', {
    isDev: import.meta.env.DEV,
    mode: import.meta.env.MODE,
    protocol: typeof window !== 'undefined' ? window.location.protocol : 'unknown',
    envApiUrl: import.meta.env.VITE_API_URL
  });

  if (import.meta.env.DEV) {
    console.log('Using development Vite proxy: /api');
    return '/api';
  }

  // In production (Vercel), use the serverless proxy to avoid HTTPS/HTTP mixed content issues
  console.log('Using Vercel serverless proxy: /api/proxy');
  return '/api/proxy';
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
  const baseUrl = getApiUrl();
  let url;

  if (baseUrl === '/api/proxy') {
    // For Vercel proxy, append the endpoint directly to the proxy path
    // Remove leading slash from endpoint to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    url = `/api/proxy/${cleanEndpoint}`;
  } else {
    url = `${baseUrl}${endpoint}`;
  }

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