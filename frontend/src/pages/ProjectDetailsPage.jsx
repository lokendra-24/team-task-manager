import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectApi } from "../api/projects";
import { getTasksApi, updateTaskApi } from "../api/tasks";
import { getProjectActivitiesApi } from "../api/activities";
import {
  FolderKanban, Users, Activity as ActivityIcon, List, LayoutDashboard,
  Plus, Search, ArrowLeft, MoreVertical, Settings
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import MemberSection from "../components/MemberSection";
import ActivityTimeline from "../components/ActivityTimeline";
import { toast } from "react-toastify";

const TABS = [
  { id: "tasks",    label: "Tasks",    icon: List },
  { id: "board",    label: "Board",    icon: LayoutDashboard },
  { id: "team",     label: "Team",     icon: Users },
  { id: "activity", label: "Activity", icon: ActivityIcon },
];

const STATUS_COLUMNS = [
  { id: "todo",        label: "Todo",        color: "bg-slate-100 text-slate-600 border-slate-200" },
  { id: "in-progress", label: "In Progress", color: "bg-blue-50 text-blue-600 border-blue-100" },
  { id: "done",        label: "Done",        color: "bg-green-50 text-green-600 border-green-100" },
];

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project,    setProject]    = useState(null);
  const [tasks,      setTasks]      = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState("tasks");
  const [search,     setSearch]     = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [projData, taskData, actData] = await Promise.all([
        getProjectApi(id),
        getTasksApi({ project_id: id, limit: 100 }),
        getProjectActivitiesApi(id),
      ]);
      setProject(projData);
      setTasks(taskData.items ?? []);
      setActivities(actData ?? []);
    } catch (err) {
      toast.error("Failed to load project details");
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskApi(taskId, { status: newStatus });
      toast.success("Status updated");
      load(); // Refresh to update activity too
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>;
  if (!project) return null;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <button onClick={() => navigate("/projects")} className="mt-1 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 shadow-sm">
                <FolderKanban size={20} />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
            </div>
            <p className="mt-1 text-sm text-slate-500">{project.description || "No description provided."}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Settings size={15} /> Settings</Button>
          <Button size="sm"><Plus size={15} /> Create Task</Button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-slate-200">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-150 border-b-2 ${
                active ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <Icon size={16} />
              {tab.label}
              {tab.id === "tasks" && <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{tasks.length}</span>}
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      <div className="pt-2">
        {/* Search Bar for tasks */}
        {(activeTab === "tasks" || activeTab === "board") && (
          <div className="mb-6 relative max-w-md">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                placeholder="Search tasks in this project..."
                value={search}
                onChange={e => setSearch(e.target.value)}
             />
          </div>
        )}

        {/* ── LIST VIEW ── */}
        {activeTab === "tasks" && (
          <div className="flex flex-col gap-2">
            {filteredTasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-slate-400">No tasks found.</div>
            ) : (
              filteredTasks.map(task => (
                <div key={task.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 hover:shadow-md transition-all">
                   <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900">{task.title}</p>
                      <div className="mt-1 flex items-center gap-2">
                         <Badge variant={task.status === "done" ? "success" : task.status === "in-progress" ? "blue" : "default"} size="sm">{task.status}</Badge>
                         <Badge variant={task.priority === "high" ? "danger" : task.priority === "medium" ? "warning" : "default"} size="sm">{task.priority}</Badge>
                         {task.assignee && <span className="text-xs text-slate-400">Assignee: {task.assignee.full_name}</span>}
                      </div>
                   </div>
                   <select
                      value={task.status}
                      onChange={e => handleStatusChange(task.id, e.target.value)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none hover:bg-white transition-all cursor-pointer"
                   >
                      <option value="todo">Todo</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                   </select>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── BOARD VIEW ── */}
        {activeTab === "board" && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {STATUS_COLUMNS.map(col => {
              const colTasks = filteredTasks.filter(t => t.status === col.id);
              return (
                <div key={col.id} className="flex flex-col gap-4">
                  <div className={`flex items-center justify-between rounded-lg border px-3 py-2 ${col.color}`}>
                    <span className="text-xs font-bold uppercase tracking-wider">{col.label}</span>
                    <span className="text-xs font-bold opacity-70">{colTasks.length}</span>
                  </div>
                  <div className="flex flex-col gap-3 min-h-[200px] rounded-xl bg-slate-50/50 p-2 border border-dashed border-slate-200">
                    {colTasks.map(task => (
                      <div key={task.id} className="group relative flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                        <div className="flex justify-between items-start gap-2">
                           <p className="text-sm font-semibold text-slate-900 leading-tight">{task.title}</p>
                           <button className="text-slate-300 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100">
                              <MoreVertical size={14} />
                           </button>
                        </div>
                        {task.description && <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>}
                        <div className="mt-2 flex items-center justify-between">
                           <Badge variant={task.priority === "high" ? "danger" : "default"} className="text-[10px] px-1.5">{task.priority}</Badge>
                           {task.assignee && (
                             <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600 border border-white" title={task.assignee.full_name}>
                                {task.assignee.full_name.charAt(0)}
                             </div>
                           )}
                        </div>
                      </div>
                    ))}
                    {colTasks.length === 0 && <div className="py-8 text-center text-xs text-slate-300">No tasks here</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── TEAM VIEW ── */}
        {activeTab === "team" && (
          <MemberSection members={project.members} ownerId={project.owner_id} />
        )}

        {/* ── ACTIVITY VIEW ── */}
        {activeTab === "activity" && (
          <div className="max-w-2xl mx-auto py-4">
             <ActivityTimeline activities={activities} />
          </div>
        )}
      </div>
    </div>
  );
}
