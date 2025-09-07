import axios from 'axios';
import AsyncStorage from "@react-native-community/async-storage";
import ApiConfig from "app/config/api-config";

const apiClient = axios.create({
  baseURL: ApiConfig.BASE_URL,
  responseType: 'json',
  timeout: 10000, // 10 seconds timeout
  //withCredentials: true,
});

// Set the AUTH token for any request
apiClient.interceptors.request.use(function (config) {
  const token = AsyncStorage.getItem('sme_user_token');
  config.headers.Authorization =  token ? `Bearer ${token}` : '';
  return config;
});

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.code === 'ECONNABORTED') {
      console.warn('API request timed out:', error.config.url);
      error.message = 'Request timed out. Please check your connection.';
    } else if (!error.response) {
      console.warn('Network error:', error.message);
      error.message = 'Network error. Please check your connection.';
    }
    return Promise.reject(error);
  }
);

export { apiClient }; 