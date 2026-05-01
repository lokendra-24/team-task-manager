import api from "./client";

export const getProjectsApi = async (params = {}) => (await api.get("/projects", { params })).data;
export const getProjectApi = async (id) => (await api.get(`/projects/${id}`)).data;
export const createProjectApi = async (payload) => (await api.post("/projects", payload)).data;

export const updateProjectApi = async (id, payload) => (await api.put(`/projects/${id}`, payload)).data;
export const deleteProjectApi = async (id) => (await api.delete(`/projects/${id}`)).data;
export const getUsersApi = async () => (await api.get("/users")).data;

