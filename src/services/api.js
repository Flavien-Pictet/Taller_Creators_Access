import axios from 'axios';
import { API_URL } from '../config/constants';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 secondes pour le scraping
});

export const fetchData = async () => {
  const response = await api.post('/api/fetch');
  return response.data;
};

export const getCachedData = async () => {
  const response = await api.get('/api/data');
  return response.data;
};

export const filterDataByDate = async (daysFilter) => {
  const response = await api.post('/api/filter', { daysFilter });
  return response.data;
};

export const getCreators = async () => {
  const response = await api.get('/api/creators');
  return response.data;
};

export default api;