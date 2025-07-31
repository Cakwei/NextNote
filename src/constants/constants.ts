export const Colors = {
  applePrimary: "#0066cc",
  white: "#ffffff",
  black: "#000000",
};

export const apiEndpoint = {
  login: "api/auth/login",
  register: "api/auth/register",
  logout: "api/auth/logout",
};

export const protectedRoutes = ["/dashboard"];

export const unprotectedRoutes = ["/Login", "/register"];
