import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiConfig from "app/config/api-config";

const apiClient = axios.create({
  baseURL: ApiConfig.BASE_URL,
  responseType: 'json',
  //withCredentials: true,
});

// Set the AUTH token for any request
apiClient.interceptors.request.use(function (config) {
  const token = AsyncStorage.getItem('sme_user_token');
  config.headers.Authorization =  token ? `Bearer ${token}` : '';
  return config;
});

export { apiClient };
