import api from "./client";

export const getTasksApi = async (params = {}) => (await api.get("/tasks", { params })).data;
export const createTaskApi = async (payload) => (await api.post("/tasks", payload)).data;
export const updateTaskApi = async (id, payload) => (await api.put(`/tasks/${id}`, payload)).data;

