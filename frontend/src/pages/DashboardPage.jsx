import { useEffect, useState } from "react";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { getDashboardApi } from "../api/dashboard";
import { ListTodo, CheckCircle2, Clock, AlertTriangle, TrendingUp, Sparkles } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";



// ── Config ────────────────────────────────────────────────────────────────────
const STAT_CARDS = [
  {
    key:       "total",
    label:     "Total Tasks",
    icon:      ListTodo,
    iconBg:    "bg-indigo-100",
    iconColor: "text-indigo-600",
    accent:    "border-t-4 border-t-indigo-500",
    numColor:  "text-indigo-700",
  },
  {
    key:       "completed",
    label:     "Completed",
    icon:      CheckCircle2,
    iconBg:    "bg-green-100",
    iconColor: "text-green-600",
    accent:    "border-t-4 border-t-green-500",
    numColor:  "text-green-700",
  },
  {
    key:       "pending",
    label:     "In Progress",
    icon:      Clock,
    iconBg:    "bg-yellow-100",
    iconColor: "text-yellow-600",
    accent:    "border-t-4 border-t-yellow-500",
    numColor:  "text-yellow-700",
  },
  {
    key:       "overdue",
    label:     "Overdue",
    icon:      AlertTriangle,
    iconBg:    "bg-red-100",
    iconColor: "text-red-600",
    accent:    "border-t-4 border-t-red-500",
    numColor:  "text-red-700",
  },
];

const PIE_COLORS = ["#6366f1", "#22c55e", "#eab308", "#ef4444"];

// ── Sub-components ─────────────────────────────────────────────────────────────
function StatCard({ cfg, value }) {
  const Icon = cfg.icon;
  return (
    <div
      className={`
        group relative overflow-hidden rounded-xl bg-white
        border border-slate-200 ${cfg.accent}
        shadow-sm transition-all duration-300
        hover:-translate-y-1 hover:shadow-lg hover:border-slate-300
        cursor-default
      `}
    >
      {/* Faint background tint */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-slate-50 to-transparent pointer-events-none" />

      <div className="relative p-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{cfg.label}</p>
          <p className={`mt-2 text-4xl font-bold tabular-nums tracking-tight ${cfg.numColor}`}>
            {value}
          </p>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${cfg.iconBg} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className={`h-6 w-6 ${cfg.iconColor}`} />
        </div>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-lg">
      <p className="text-xs text-slate-500">{payload[0].name}</p>
      <p className="text-2xl font-bold text-slate-900">{payload[0].value}</p>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchDashboard = () => {
    setLoading(true);
    setError(null);
    getDashboardApi()
      .then((r) => { setData(r); })
      .catch((err) => {
        setError(err?.response?.data?.detail ?? err?.message ?? "Failed to load dashboard.");
      })
      .finally(() => { setLoading(false); });
  };

  useEffect(() => { fetchDashboard(); }, []);

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-40 rounded-lg bg-slate-200 animate-pulse mb-2" />
          <div className="h-4 w-64 rounded-lg bg-slate-100 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[0,1,2,3].map(i => (
            <div key={i} className="h-32 rounded-xl bg-slate-100 animate-pulse border-t-4 border-t-slate-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="h-80 rounded-xl bg-slate-100 animate-pulse lg:col-span-2" />
          <div className="h-80 rounded-xl bg-slate-100 animate-pulse" />
        </div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-5 max-w-md w-full shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Failed to load dashboard</p>
              <p className="mt-1 text-xs text-red-500 break-all">{error}</p>
            </div>
          </div>
          <button
            id="dashboard-retry-btn"
            onClick={fetchDashboard}
            className="mt-4 w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { stats } = data;
  const completionRate = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  const chartData = STAT_CARDS.map(c => ({ name: c.label, value: stats[c.key] ?? 0 }));

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Welcome, {user?.full_name}!</h2>
          <p className="mt-1 text-sm text-slate-500">Here's what's happening across your team.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2 shadow-sm">
          <TrendingUp size={16} className="text-green-600" />
          <span className="text-sm font-bold text-green-700">{completionRate}% done</span>
        </div>
      </div>

      {/* ── Onboarding / Empty State ── */}
      {stats.total === 0 && (
        <div className="rounded-2xl bg-indigo-600 p-8 text-white shadow-xl shadow-indigo-200 overflow-hidden relative">
           <div className="relative z-10">
              <h3 className="text-xl font-bold">Ready to boost your team's productivity? 🚀</h3>
              <p className="mt-2 text-indigo-100 max-w-xl">
                 It looks like you haven't created any tasks yet. Start by creating a project, invite your team, and assign your first task to see the magic happen.
              </p>
              <div className="mt-6 flex gap-3">
                 <Button onClick={() => window.location.href='/projects'} className="bg-white text-indigo-600 hover:bg-indigo-50 border-none">
                    Create Project
                 </Button>
                 <Button variant="outline" className="border-indigo-400 text-white hover:bg-indigo-500">
                    Watch Demo
                 </Button>
              </div>
           </div>
           <Sparkles size={120} className="absolute -bottom-8 -right-8 text-indigo-500 opacity-20 rotate-12" />
        </div>
      )}


      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((cfg) => (
          <StatCard key={cfg.key} cfg={cfg} value={stats[cfg.key] ?? 0} />
        ))}
      </div>

      {/* ── Chart row ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Donut chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="text-base font-semibold text-slate-900">Task Distribution</h3>
          <p className="mt-0.5 text-xs text-slate-400">Breakdown of all tasks by status</p>
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={v => <span className="text-xs text-slate-500 font-medium">{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progress bars */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Summary</h3>
          <p className="mt-0.5 text-xs text-slate-400">At a glance</p>
          <div className="mt-6 flex flex-col gap-5">
            {STAT_CARDS.map((cfg) => {
              const val = stats[cfg.key] ?? 0;
              const pct = stats.total > 0 ? Math.round((val / stats.total) * 100) : 0;
              const barColors = {
                total: "bg-indigo-500",
                completed: "bg-green-500",
                pending: "bg-yellow-500",
                overdue: "bg-red-500",
              };
              return (
                <div key={cfg.key}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-600">{cfg.label}</span>
                    <span className="text-xs font-bold text-slate-800">{val}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${barColors[cfg.key]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>


      {/* ── Task Lists ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Left Column: My Tasks */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
           <div className="mb-4 flex items-center justify-between">
              <div>
                 <h3 className="text-base font-semibold text-slate-900">Assigned to You</h3>
                 <p className="text-xs text-slate-400">Tasks you need to work on</p>
              </div>
              <Badge variant="blue" size="sm">{Object.values(data.grouped).flat().filter(t => t.assignee_id === user?.id && t.status !== "done").length}</Badge>
           </div>
           <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
              {Object.values(data.grouped).flat()
                .filter(t => t.assignee_id === user?.id && t.status !== "done")
                .map(task => (
                  <div key={task.id} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 transition-all hover:bg-slate-100">
                     <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                           <Badge variant={task.status === "in-progress" ? "blue" : "default"} className="text-[9px] h-3.5 px-1">{task.status}</Badge>
                           {task.due_date && <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock size={10} /> {task.due_date}</span>}
                        </div>
                     </div>
                  </div>
                ))}
              {Object.values(data.grouped).flat().filter(t => t.assignee_id === user?.id && t.status !== "done").length === 0 && (
                <div className="py-8 text-center text-sm text-slate-400 italic">No tasks assigned to you.</div>
              )}
           </div>
        </div>

        {/* Right Column: Overdue & Due Soon */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
           <div className="mb-4 flex items-center justify-between">
              <div>
                 <h3 className="text-base font-semibold text-slate-900">Priority Alerts</h3>
                 <p className="text-xs text-slate-400">Overdue or due soon</p>
              </div>
              <Badge variant="danger" size="sm">{Object.values(data.grouped).flat().filter(t => (t.is_overdue || t.priority === "high") && t.status !== "done").length}</Badge>
           </div>
           <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
              {Object.values(data.grouped).flat()
                .filter(t => (t.is_overdue || t.priority === "high") && t.status !== "done")
                .sort((a, b) => (a.is_overdue ? -1 : 1))
                .map(task => (
                  <div key={task.id} className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${task.is_overdue ? "border-red-100 bg-red-50 hover:bg-red-100/50" : "border-slate-100 bg-slate-50 hover:bg-slate-100"}`}>
                     <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                           {task.is_overdue && <Badge variant="danger" className="text-[9px] h-3.5 px-1">OVERDUE</Badge>}
                           <Badge variant="warning" className="text-[9px] h-3.5 px-1">{task.priority}</Badge>
                           {task.due_date && <span className="text-[10px] text-slate-400">{task.due_date}</span>}
                        </div>
                     </div>
                  </div>
                ))}
              {Object.values(data.grouped).flat().filter(t => (t.is_overdue || t.priority === "high") && t.status !== "done").length === 0 && (
                <div className="py-8 text-center text-sm text-slate-400 italic">No urgent tasks. Good job!</div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

