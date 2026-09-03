import API from "./client";

export const orders = {
  myOrders: () => API.get("/orders/orders/"),

  create: (data) =>
    API.post("/orders/orders/", data),

  update: (orderId, data) =>
    API.patch(`/orders/orders/${orderId}/`, data),
};