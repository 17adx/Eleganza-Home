import axios from "axios";
console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
