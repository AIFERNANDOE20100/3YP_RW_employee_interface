import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://localhost:5000',
  // baseURL: 'http://16.176.179.124:5000',
  baseURL: 'https://employee-server.duckdns.org',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
