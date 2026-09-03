import API from "./client";

export const carts = {
  myCart: () => API.get("/orders/carts/my/"),

  myCarts: () => API.get("/orders/carts/"),

  createCart: (sessionKey = "") =>
    API.post("/orders/carts/", {
      session_key: sessionKey,
    }),

  listItems: (cartId) =>
    API.get(`/orders/carts/${cartId}/items/`),

  addItem: (cartId, data) =>
    API.post(`/orders/carts/${cartId}/items/`, data),

  updateItem: (cartId, itemId, data) =>
    API.patch(`/orders/carts/${cartId}/items/${itemId}/`, data),

  deleteItem: (cartId, itemId) =>
    API.delete(`/orders/carts/${cartId}/items/${itemId}/`),

  updateQuantity: (cartId, itemId, data) =>
    API.patch(
      `/orders/carts/${cartId}/items/${itemId}/update_quantity/`,
      data
    ),
};