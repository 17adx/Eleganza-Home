import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
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

export const carts = {
  myCarts: () => API.get("/orders/carts/"),
  createCart: (session_key = "") => API.post("/orders/carts/", { session_key }),
  listItems: (cartId) => API.get(`/carts/${cartId}/items/`),
  addItem: (cartId, data) => API.post(`/carts/${cartId}/items/`, data),
  updateItem: (cartId, itemId, data) =>
    API.put(`/carts/${cartId}/items/${itemId}/`, data),
  deleteItem: (cartId, itemId) => API.delete(`/carts/${cartId}/items/${itemId}/`),
};

export const orders = {
  myOrders: () => API.get("/orders/orders/"),
  create: (data) => API.post("/orders/orders/", data),
};

export const auth = {
  register: (data) => API.post("/auth/register/", data),
  login: (data) => API.post("/auth/login/", data),
  resendActivation: (email) =>
    API.post("/auth/resend-activation/", { email }),
  me: () => API.get("/auth/me/"),
  profileMe: () => API.get("/auth/me/profile/"),
};

export default API;