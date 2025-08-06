export const ENV = {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_APP_ORIGIN: import.meta.env.VITE_APP_ORIGIN || "http://localhost:5173",
};

// Get the backend base URL for static files (without /api path)
export const getBackendBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  if (!apiUrl) return "http://localhost:8000";
  
  // Remove /api from the end if it exists
  return apiUrl.replace(/\/api$/, "");
};
