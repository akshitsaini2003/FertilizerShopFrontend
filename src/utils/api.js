import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // .env se URL lena
});

API.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    config.headers.Authorization = `Bearer ${JSON.parse(userInfo).token}`;
  }
  return config;
});

export default API;
