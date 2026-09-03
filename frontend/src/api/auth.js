import API from "./client";

export const auth = {
  register: (data) =>
    API.post("/auth/register/", data),

  login: (data) =>
    API.post("/auth/login/", data),

  resendActivation: (email) =>
    API.post("/auth/resend-activation/", { email }),

  activate: (uid, token) =>
    API.get(`/auth/activate/${uid}/${token}/`),

  resetPassword: (email) =>
    API.post("/auth/users/reset_password/", { email }),

  resetPasswordConfirm: (data) =>
    API.post("/auth/users/reset_password_confirm/", data),

  socialLogin: (provider) =>
    API.get(`/auth/login/${provider}/`),

  socialLoginJwt: () =>
    API.get("/auth/social-login-jwt/"),

  me: () =>
    API.get("/auth/me/"),

  profileMe: () =>
    API.get("/auth/me/profile/"),
};