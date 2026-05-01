import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getProjectsApi } from "../api/projects";
import { createTaskApi, getTasksApi, updateTaskApi } from "../api/tasks";
import {
  Search, SlidersHorizontal, AlertCircle, Calendar,
  Plus, CheckCircle2, Circle, Clock, X, Sparkles
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { useAuth } from "../context/AuthContext";
import { Tooltip } from "../components/ui/Tooltip";
import { Avatar } from "../components/ui/Avatar";
import { List, LayoutDashboard } from "lucide-react";


// ── Static config ──────────────────────────────────────────────────────────────
const INIT_FILTERS = { status: "", priority: "", search: "", sort_by: "due_date", project_id: "" };

const STATUS_CFG = {
  "todo":        { label: "Todo",        variant: "default", icon: Circle,       leftBorder: "border-l-slate-300" },
  "in-progress": { label: "In Progress", variant: "blue",    icon: Clock,        leftBorder: "border-l-blue-500"  },
  "done":        { label: "Done",        variant: "success", icon: CheckCircle2, leftBorder: "border-l-green-500" },
};

const PRIORITY_CFG = {
  "low":    { label: "Low",    variant: "default" },
  "medium": { label: "Medium", variant: "warning" },
  "high":   { label: "High",   variant: "danger"  },
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const selectCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm appearance-none " +
  "focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-150";
const inputCls = selectCls;

// ── Page ───────────────────────────────────────────────────────────────────────
export default function TasksPage() {
  const [projects,  setProjects]  = useState([]);
  const [tasks,     setTasks]     = useState([]);
  const [filters,   setFilters]   = useState(INIT_FILTERS);
  const [loading,   setLoading]   = useState(true);
  const [creating,  setCreating]  = useState(false);
  const [showForm,  setShowForm]  = useState(false);
  const [view,      setView]      = useState("list"); // "list" or "board"
  const [page,      setPage]      = useState(1);
  const [total,     setTotal]     = useState(0);
  const { user } = useAuth();

  const limit = 10;

  const [form, setForm] = useState({
    project_id: "", title: "", description: "",
    status: "todo", priority: "medium", due_date: "", assignee_id: "",
  });

  const load = async () => {
    setLoading(true);
    const offset = (page - 1) * limit;
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ""));
    const [taskData, projData] = await Promise.all([
      getTasksApi({ ...params, limit, offset }),
      getProjectsApi({ limit: 100 }),
    ]);
    setTasks(taskData.items ?? []);
    setTotal(taskData.total ?? 0);
    setProjects(projData.items ?? []);
    setLoading(false);
  };

  // reset page when filters change
  useEffect(() => { setPage(1); }, [filters.status, filters.priority, filters.search, filters.sort_by, filters.project_id]);
  useEffect(() => { load(); },    [page, filters.status, filters.priority, filters.search, filters.sort_by, filters.project_id]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createTaskApi({ ...form, project_id: Number(form.project_id), assignee_id: form.assignee_id ? Number(form.assignee_id) : null });
      toast.success("Task created!");
      setForm(f => ({ ...f, title: "", description: "", due_date: "" }));
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail ?? "Task creation failed");
    } finally { setCreating(false); }
  };

  const hasFilters = filters.status || filters.priority || filters.search || filters.project_id;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Tasks</h2>
          <p className="mt-1 text-sm text-slate-500">
            {total > 0 ? `${total} task${total !== 1 ? "s" : ""} found` : "Track and manage work across your team."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 mr-2">
             <button
                onClick={() => setView("list")}
                className={`p-1.5 rounded-md transition-all ${view === "list" ? "bg-indigo-50 text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                title="List View"
             >
                <List size={16} />
             </button>
             <button
                onClick={() => setView("board")}
                className={`p-1.5 rounded-md transition-all ${view === "board" ? "bg-indigo-50 text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                title="Board View"
             >
                <LayoutDashboard size={16} />
             </button>
          </div>
          <Button onClick={() => setShowForm(v => !v)} variant={showForm ? "outline" : "primary"}>
            {showForm ? <><X size={15} /> Cancel</> : <><Plus size={15} /> New Task</>}
          </Button>
        </div>

      </div>

      {/* ── Create form ── */}
      {showForm && (
        <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
              <Sparkles size={15} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">New task</p>
              <p className="text-xs text-slate-400">Fill in the details below</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-4 items-start">
            {/* Row 1 */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Project</label>
              <select className={selectCls} required disabled={projects.length === 0}
                value={form.project_id} onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))}>
                <option value="">{projects.length === 0 ? "No projects available" : "Select project…"}</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Title</label>
              <input className={inputCls} placeholder="What needs to be done?" required
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            {/* Row 2 */}
            <div className="md:col-span-4">
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Description</label>
              <input className={inputCls} placeholder="Add more context…"
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            {/* Row 3 */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Due Date</label>
              <input className={inputCls} type="date"
                value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Assignee ID</label>
              <input className={inputCls} type="number" placeholder="User ID"
                value={form.assignee_id} onChange={e => setForm(f => ({ ...f, assignee_id: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Status</label>
              <select className={selectCls} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Priority</label>
              <select className={selectCls} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="md:col-span-4 flex justify-end pt-1">
              <Button type="submit" isLoading={creating} disabled={projects.length === 0}>
                Save Task
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ── Filter bar ── */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid gap-2.5 md:grid-cols-5">
          <div className="relative md:col-span-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm
                         placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-150"
              placeholder="Search tasks…"
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>
          <div className="relative">
            <SlidersHorizontal size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select className={`${selectCls} pl-9`} value={filters.status}
              onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              <option value="">All Statuses</option>
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="relative">
            <SlidersHorizontal size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select className={`${selectCls} pl-9`} value={filters.priority}
              onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}>
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="relative">
            <SlidersHorizontal size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select className={`${selectCls} pl-9`} value={filters.sort_by}
              onChange={e => setFilters(f => ({ ...f, sort_by: e.target.value }))}>
              <option value="due_date">Sort: Due Date</option>
              <option value="priority">Sort: Priority</option>
              <option value="status">Sort: Status</option>
              <option value="created_at">Sort: Created</option>
            </select>
          </div>
        </div>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2.5">
            <span className="text-xs text-slate-400 font-medium">Filters:</span>
            {filters.status && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                {filters.status}
                <button onClick={() => setFilters(f => ({ ...f, status: "" }))} className="hover:text-blue-900 ml-0.5"><X size={10} /></button>
              </span>
            )}
            {filters.priority && (
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 border border-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-700">
                {filters.priority}
                <button onClick={() => setFilters(f => ({ ...f, priority: "" }))} className="hover:text-yellow-900 ml-0.5"><X size={10} /></button>
              </span>
            )}
            {filters.search && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                "{filters.search}"
                <button onClick={() => setFilters(f => ({ ...f, search: "" }))} className="hover:text-slate-800 ml-0.5"><X size={10} /></button>
              </span>
            )}
            <button onClick={() => setFilters(INIT_FILTERS)}
              className="ml-auto text-xs text-slate-400 hover:text-slate-700 transition-colors">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Task list ── */}
      <div className="flex flex-col gap-2.5">
        {loading ? (
          [1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />)
        ) : tasks.length === 0 ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-24 text-center">
            <div className="relative mb-5">
              <div className="flex h-18 w-18 items-center justify-center rounded-2xl bg-slate-100 p-5 shadow-inner">
                <CheckCircle2 size={36} className="text-slate-300" />
              </div>
              <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100">
                <Sparkles size={12} className="text-indigo-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              {hasFilters ? "No matching tasks" : "No tasks yet"}
            </h3>
            <p className="mt-1.5 max-w-xs text-sm text-slate-500">
              {hasFilters
                ? "Try changing your filters to find what you're looking for."
                : "You're all caught up! Create your first task to start tracking work."}
            </p>
            <div className="mt-5 flex gap-3">
              {hasFilters && (
                <Button variant="outline" onClick={() => setFilters(INIT_FILTERS)}>Clear Filters</Button>
              )}
              <Button onClick={() => setShowForm(true)}>
                <Plus size={15} /> Create Task
              </Button>
            </div>
          </div>
        ) : view === "board" ? (
          /* ── Board View ── */
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 items-start">
             {[
               { id: "todo", label: "Todo", icon: Circle, color: "text-slate-400" },
               { id: "in-progress", label: "In Progress", icon: Clock, color: "text-blue-500" },
               { id: "done", label: "Done", icon: CheckCircle2, color: "text-green-500" }
             ].map(col => {
                const colTasks = tasks.filter(t => t.status === col.id);
                return (
                  <div key={col.id} className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                       <div className="flex items-center gap-2">
                          <col.icon size={16} className={col.color} />
                          <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">{col.label}</span>
                       </div>
                       <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">{colTasks.length}</span>
                    </div>
                    <div className="flex flex-col gap-3 min-h-[400px] rounded-2xl bg-slate-50/50 p-2 border border-dashed border-slate-200">
                       {colTasks.map(task => {
                          const pCfg = PRIORITY_CFG[task.priority] ?? PRIORITY_CFG["medium"];
                          return (
                            <div key={task.id} className="group relative flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                               <div className="flex justify-between items-start gap-2">
                                  <p className="text-sm font-semibold text-slate-900 leading-tight">{task.title}</p>
                                  <button className="text-slate-300 hover:text-slate-600 transition-colors">
                                     <MoreVertical size={14} />
                                  </button>
                               </div>
                               {task.description && <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>}
                               <div className="mt-1 flex flex-wrap gap-1.5">
                                  <Badge variant={pCfg.variant} className="text-[10px] px-1.5">{pCfg.label}</Badge>
                                  {task.is_overdue && task.status !== "done" && (
                                     <Badge variant="danger" className="text-[10px] px-1.5">Overdue</Badge>
                                  )}
                               </div>
                               <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-50">
                                  <div className="flex items-center gap-1.5">
                                     {task.assignee ? (
                                        <Tooltip content={`Assigned to ${task.assignee.full_name}`}>
                                           <Avatar name={task.assignee.full_name} size="xs" />
                                        </Tooltip>
                                     ) : (
                                        <div className="h-6 w-6 rounded-full border border-dashed border-slate-300" />
                                     )}
                                  </div>
                                  <select
                                     value={task.status}
                                     onChange={async e => { await updateTaskApi(task.id, { status: e.target.value }); load(); }}
                                     className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold outline-none hover:bg-white transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                                  >
                                     <option value="todo">Todo</option>
                                     <option value="in-progress">In Progress</option>
                                     <option value="done">Done</option>
                                  </select>
                               </div>
                            </div>
                          );
                       })}
                       {colTasks.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                             <Plus size={24} className="text-slate-300 mb-2" />
                             <p className="text-[10px] font-medium text-slate-400">No tasks</p>
                          </div>
                       )}
                    </div>
                  </div>
                );
             })}
          </div>
        ) : (
          /* ── List View ── */
          tasks.map((task) => {
            const sCfg = STATUS_CFG[task.status] ?? STATUS_CFG["todo"];
            const pCfg = PRIORITY_CFG[task.priority] ?? PRIORITY_CFG["medium"];
            const SIcon = sCfg.icon;
            const overdue = task.is_overdue && task.status !== "done";

            return (
              <div
                key={task.id}
                className={`
                  group flex items-start gap-4 rounded-xl border-l-4 bg-white px-5 py-4
                  border border-slate-200 shadow-sm
                  transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
                  ${sCfg.leftBorder}
                  ${overdue ? "bg-red-50/40 border-slate-200" : ""}
                `}
              >
                {/* Status icon */}
                <div className="mt-0.5 shrink-0">
                  <SIcon
                    size={18}
                    className={
                      task.status === "done" ? "text-green-500"
                      : task.status === "in-progress" ? "text-blue-500"
                      : "text-slate-300"
                    }
                  />
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`font-semibold text-slate-900 ${task.status === "done" ? "line-through text-slate-400" : ""}`}>
                      {task.title}
                    </span>
                    {task.assignee_id === user?.id && (
                      <Badge variant="blue" className="text-[10px] py-0 px-1.5 h-4">Assigned to you</Badge>
                    )}
                    {task.creator_id === user?.id && (
                      <Badge variant="default" className="text-[10px] py-0 px-1.5 h-4">Created by you</Badge>
                    )}
                    {overdue && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 border border-red-200 px-2 py-0.5 text-[11px] font-bold text-red-600">
                        <AlertCircle size={10} /> Overdue
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-sm text-slate-500 mb-2.5 line-clamp-1">{task.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    <Tooltip content={`Status: ${sCfg.label}`}>
                      <Badge variant={sCfg.variant} showDot>{sCfg.label}</Badge>
                    </Tooltip>
                    <Tooltip content={`Priority: ${pCfg.label}`}>
                      <Badge variant={pCfg.variant}>{pCfg.label}</Badge>
                    </Tooltip>
                    {task.due_date && (
                      <Tooltip content="Due date">
                        <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-medium
                          ${overdue ? "bg-red-50 text-red-600 border border-red-100" : "bg-slate-100 text-slate-600"}`}>
                          <Calendar size={11} />
                          {new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </Tooltip>
                    )}
                    {task.assignee && (
                      <Tooltip content={`Assigned to ${task.assignee.full_name}`}>
                        <div className="flex items-center gap-1.5 ml-1">
                           <Avatar name={task.assignee.full_name} size="xs" />
                           <span className="text-[11px] text-slate-400 font-medium truncate max-w-[80px]">{task.assignee.full_name}</span>
                        </div>
                      </Tooltip>
                    )}
                  </div>
                </div>

                {/* Status dropdown */}
                <div className="shrink-0">
                  <select
                    value={task.status}
                    onChange={async e => { await updateTaskApi(task.id, { status: e.target.value }); load(); }}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700
                               focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                               appearance-none cursor-pointer hover:border-slate-300 hover:bg-white transition-all duration-150"
                  >
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
            );
          })
        )}
      </div>


      {/* ── Pagination ── */}


      {total > limit && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-900">{(page - 1) * limit + 1}</span>–<span className="font-semibold text-slate-900">{Math.min(page * limit, total)}</span>
            {" "}of{" "}<span className="font-semibold text-slate-900">{total}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              ← Prev
            </Button>
            <span className="min-w-[2rem] text-center text-sm font-bold text-slate-700">{page}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / limit)}>
              Next →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
