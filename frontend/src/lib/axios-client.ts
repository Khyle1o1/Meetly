import axios from "axios";
import { useStore } from "@/store/store";
import { CustomError } from "@/types/custom-error.type";
import { ENV } from "./get-env";

// Debug logging
console.log("API Base URL from ENV:", ENV.VITE_API_BASE_URL);
console.log("Environment variables:", {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_APP_ORIGIN: import.meta.env.VITE_APP_ORIGIN,
});

// Use environment variable if available, otherwise use proxy
const baseURL = ENV.VITE_API_BASE_URL || "/api";

console.log("Final Base URL:", baseURL);

const options = {
  baseURL,
  withCredentials: true,
  timeout: 10000,
};

//*** FOR API WITH TOKEN */
export const API = axios.create(options);

API.interceptors.request.use((config) => {
  const accessToken = useStore.getState().accessToken;
  if (accessToken) {
    config.headers["Authorization"] = "Bearer " + accessToken;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { data, status } = error.response;
    if (data === "Unauthorized" && status === 401) {
      const store = useStore.getState();
      store.clearUser();
      store.clearAccessToken();
      store.clearExpiresAt();
      window.location.href = "/";
    }

    console.log(data, "data");
    const customError: CustomError = {
      ...error,
      message: data?.message,
      errorCode: data?.errorCode || "UNKNOWN_ERROR",
    };

    return Promise.reject(customError);
  }
);

//*** FOR API DONT NEED TOKEN */
export const PublicAPI = axios.create(options);

PublicAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { data } = error.response;
    const customError: CustomError = {
      ...error,
      message: data?.message,
      errorCode: data?.errorCode || "UNKNOWN_ERROR",
    };
    return Promise.reject(customError);
  }
);
