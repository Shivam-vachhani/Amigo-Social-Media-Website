"use client";
import axios from "axios";
import { logger } from "./logger";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

let isResfreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      logger.log("🚨 401 detected, refreshing token...");
      if (isResfreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isResfreshing = true;

      try {
        const refreshResponse = await api.post(
          "/authMe/refresh",
          {},
          {
            withCredentials: true,
          },
        );
        logger.log("✅ Refresh successful:", refreshResponse.data);
        processQueue(null);
        isResfreshing = false;
        return api(originalRequest);
      } catch (err) {
        processQueue(err);
        isResfreshing = false;
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);
