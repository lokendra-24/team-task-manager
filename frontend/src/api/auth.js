import api from "./client";

export const signupApi = async (payload) => (await api.post("/auth/signup", payload)).data;
export const loginApi = async (payload) => (await api.post("/auth/login", payload)).data;

