import api from "./client";

export const getProjectActivitiesApi = async (projectId) => (await api.get(`/projects/${projectId}/activities`)).data;
