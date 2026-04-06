export const endpoint = {
  LOGIN: "/api/auth/login",
  LOGOUT: "/api/auth/logout",
  FORGETPASSWORD: "/api/auth/forget-password",
  REFRESH: "/api/auth/refresh",
  BUSES: "/api/buses",
  BUS: (id) => `/api/buses/${id}`,
  USERS: "/api/users",
  USER: (id) => `/api/users/${id}`,
  // REPORTS------------------------------
  REPORT_RESPONSE: (id) => `/api/reports/response/${id}`,
  REPORTS: "/api/reports",
  REPORT_DELETE: (id) => `/api/reports/${id}`,
  FETCH_REPORT: (userId) => `/api/reports/user/${userId}`,
  ALL_REPORTS: "/api/reports/all",
  POST_REPORT: "/api/reports",
  // -------------------------------------
  // Add more endpoints as needed
};
