import api from "./client";

/**
 * Fetches dashboard summary from GET /dashboard.
 *
 * The backend returns flat fields (total_tasks, completed_tasks, …).
 * We normalise them into { stats: { total, completed, pending, overdue } }
 * so that DashboardPage doesn't need to know about the wire format.
 */
export const getDashboardApi = async () => {
  const { data } = await api.get("/dashboard");
  return {
    stats: {
      total: data.total_tasks,
      completed: data.completed_tasks,
      pending: data.pending_tasks,
      overdue: data.overdue_tasks,
    },
  };
};

