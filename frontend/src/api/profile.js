import API from "./client";

export const profile = {
  me: () => API.get("/auth/me/profile/"),

  update: (data) =>
    API.put("/auth/me/profile/", data),
};