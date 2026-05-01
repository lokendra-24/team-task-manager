import React from "react";
import { Avatar } from "./ui/Avatar";
import { Clock, PlusCircle, CheckCircle2, UserPlus, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const ACTION_ICONS = {
  created_task: { icon: PlusCircle, color: "text-indigo-500", bg: "bg-indigo-50" },
  updated_status: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" },
  assigned_task: { icon: UserPlus, color: "text-blue-500", bg: "bg-blue-50" },
  default: { icon: Info, color: "text-slate-500", bg: "bg-slate-50" },
};

export default function ActivityTimeline({ activities = [] }) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock size={32} className="text-slate-200 mb-2" />
        <p className="text-sm text-slate-400">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, idx) => {
          const cfg = ACTION_ICONS[activity.action] || ACTION_ICONS.default;
          const Icon = cfg.icon;
          const isLast = idx === activities.length - 1;

          return (
            <li key={activity.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-slate-100"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3">
                  <div className="relative shrink-0">
                    <Avatar name={activity.user?.full_name} size="sm" />
                    <div className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white ${cfg.bg}`}>
                       <Icon size={10} className={cfg.color} />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 py-0.5">
                    <div className="text-sm text-slate-500">
                      <span className="font-semibold text-slate-900">
                        {activity.user?.full_name}
                      </span>{" "}
                      {activity.details || activity.action.replace("_", " ")}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
