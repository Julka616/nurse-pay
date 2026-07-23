import axios from "axios";

// Użyj zmiennej środowiskowej LUB bezpośredniego adresu produkcyjnego Rendera
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://nurse-pay.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;