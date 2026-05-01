import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


import { toast } from "react-toastify";
import { createProjectApi, deleteProjectApi, getProjectsApi, getUsersApi } from "../api/projects";
import { useAuth } from "../context/AuthContext";
import { FolderKanban, Users, Trash2, Plus } from "lucide-react";
import { Button } from "../components/ui/Button";

// Per-project accent palettes (cycles)
const ACCENTS = [
  { bar: "bg-indigo-500",  icon: "bg-indigo-100 text-indigo-600"  },
  { bar: "bg-violet-500",  icon: "bg-violet-100 text-violet-600"  },
  { bar: "bg-blue-500",    icon: "bg-blue-100 text-blue-600"      },
  { bar: "bg-emerald-500", icon: "bg-emerald-100 text-emerald-600"},
  { bar: "bg-rose-500",    icon: "bg-rose-100 text-rose-600"      },
  { bar: "bg-amber-500",   icon: "bg-amber-100 text-amber-600"    },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 " +
  "focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-150";

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [users,    setUsers]    = useState([]);
  const [form,     setForm]     = useState({ name: "", description: "", member_ids: [] });
  const [creating, setCreating] = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const limit = 10;

  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";


  const load = async () => {
    setLoading(true);
    const offset = (page - 1) * limit;
    const [data, userData] = await Promise.all([
      getProjectsApi({ limit, offset }),
      isAdmin ? getUsersApi() : Promise.resolve([]),
    ]);
    setProjects(data.items ?? []);
    setTotal(data.total ?? 0);
    setUsers(userData);
    setLoading(false);
  };

  useEffect(() => { load(); }, [page]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createProjectApi(form);
      toast.success("Project created!");
      setForm({ name: "", description: "", member_ids: [] });
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail ?? "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Projects</h2>
          <p className="mt-1 text-sm text-slate-500">Manage workspaces and team access.</p>
        </div>
        {total > 0 && (
          <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 shadow-sm">
            {total} project{total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Create form ── */}
      {isAdmin && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 transition-colors duration-200 hover:border-indigo-300 hover:bg-indigo-50/20">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
              <Plus size={15} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">New project</p>
              <p className="text-xs text-slate-400">Set up a new team workspace</p>
            </div>
          </div>
          <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-4 items-start">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Name</label>
              <input className={inputCls} placeholder="Project name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Description</label>
              <input className={inputCls} placeholder="Short description…" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Members <span className="font-normal text-slate-400">(Ctrl+click)</span>
              </label>
              <select multiple className={inputCls}
                onChange={e => setForm({ ...form, member_ids: Array.from(e.target.selectedOptions, o => Number(o.value)) })}>
                {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
              </select>
            </div>
            <div className="md:col-span-4 flex justify-end">
              <Button type="submit" isLoading={creating}>
                <Plus size={15} />
                Create Project
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ── Grid ── */}
      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => <div key={i} className="h-52 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : projects.length === 0 ? (
        /* ── Empty state ── */
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 shadow-inner">
            <FolderKanban size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No projects yet</h3>
          <p className="mt-1 max-w-xs text-sm text-slate-500">
            Projects organise your team's work. {isAdmin ? "Create your first one above." : "Ask an admin to add you to a project."}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, idx) => {
            const acc = ACCENTS[idx % ACCENTS.length];
            return (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50
                           shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-slate-300 cursor-pointer"
              >
                {/* Top accent bar */}
                <div className={`h-1 w-full ${acc.bar}`} />


                <div className="flex flex-1 flex-col p-5">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${acc.icon} shadow-sm`}>
                        <FolderKanban size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{project.name}</p>
                        <p className="truncate text-xs text-slate-500 mt-0.5">
                          {project.description || "No description"}
                        </p>
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={async () => {
                          if (window.confirm(`Delete "${project.name}"?`)) {
                            await deleteProjectApi(project.id);
                            toast.success("Project deleted");
                            load();
                          }
                        }}
                        className="shrink-0 rounded-lg p-1.5 text-slate-300 opacity-0 transition-all duration-150
                                   hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Users size={13} className="text-slate-400" />
                      <span>{project.members?.length ?? 0} member{(project.members?.length ?? 0) !== 1 ? "s" : ""}</span>
                    </div>
                    {/* Avatar stack */}
                    <div className="flex items-center -space-x-2">
                      {project.members?.slice(0, 4).map((m, i) => (
                        <div
                          key={i}
                          title={m.full_name}
                          className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white
                                     bg-gradient-to-br from-indigo-400 to-violet-500
                                     text-[10px] font-bold text-white shadow-sm"
                        >
                          {m.full_name?.charAt(0).toUpperCase() ?? "?"}
                        </div>
                      ))}
                      {(project.members?.length ?? 0) > 4 && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white
                                        bg-slate-100 text-[10px] font-bold text-slate-600">
                          +{(project.members?.length ?? 0) - 4}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {total > limit && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-900">{(page - 1) * limit + 1}</span>
            –
            <span className="font-semibold text-slate-900">{Math.min(page * limit, total)}</span>
            {" "}of{" "}
            <span className="font-semibold text-slate-900">{total}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              ← Prev
            </Button>
            <span className="min-w-[2rem] text-center text-sm font-semibold text-slate-700">{page}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / limit)}>
              Next →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
