import API from "./client";

export const catalog = {
  listProducts: (params) =>
    API.get("/catalog/products/", { params }),

  getProduct: (id) =>
    API.get(`/catalog/products/${id}/`),

  listCategories: () =>
    API.get("/catalog/categories/"),

  listBrands: () =>
    API.get("/catalog/brands/"),

  listTags: () =>
    API.get("/catalog/tags/"),

  listReviews: (productId) =>
    API.get(`/catalog/products/${productId}/reviews/`),

  createReview: (productId, data) =>
    API.post(`/catalog/products/${productId}/reviews/`, data),

  sellerProducts: () =>
    API.get("/catalog/products/seller/"),

  featuredProducts: () =>
    API.get("/catalog/products/featured/"),

  newArrivals: () =>
    API.get("/catalog/products/", {
      params: {
        ordering: "-created_at",
      },
    }),

  createProduct: (data) =>
    API.post("/catalog/products/", data),

  updateProduct: (productId, data) =>
    API.put(`/catalog/products/${productId}/`, data),

  wishlist: () =>
  API.get("/catalog/wishlist/"),

  addToWishlist: (productId) =>
  API.post("/catalog/wishlist/", {
    product_id: productId,
}),

  deleteWishlistItem: (itemId) =>
  API.delete(`/catalog/wishlist/${itemId}/`),

  updateWishlistItem: (itemId, data) =>
  API.patch(`/catalog/wishlist/${itemId}/`, data),
};