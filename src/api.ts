import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API = axios.create({
  baseURL: 'http://10.108.149.164:8000/api',
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    // Do not set a global Content-Type header. Let the client (browser/axios/FormData)
    // set Content-Type, especially for multipart/form-data uploads which require a boundary.
  }
});

// Add response interceptor to handle errors
API.interceptors.response.use(
  response => response,
  error => {
    console.log('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Add request interceptor for auth token
API.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default API;
