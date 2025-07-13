// lib/axios.ts or lib/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8000', // Laravel backend URL
  withCredentials: true, // Required for Sanctum authentication
});

// Add an interceptor to ensure CSRF token is set before requests
let csrfCookieFetched = false;

instance.interceptors.request.use(async (config) => {
  // If the CSRF cookie hasn't been fetched yet, get it first
  if (!csrfCookieFetched && !config.url?.includes('/sanctum/csrf-cookie')) {
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
      withCredentials: true,
    });
    csrfCookieFetched = true;
  }

  return config;
});

export default instance;
