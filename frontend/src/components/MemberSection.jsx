import React from "react";
import { Avatar } from "./ui/Avatar";
import { Badge } from "./ui/Badge";
import { Shield, User, Mail } from "lucide-react";

export default function MemberSection({ members = [], ownerId }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => {
        const isOwner = member.id === ownerId;
        return (
          <div
            key={member.id}
            className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300"
          >
            <Avatar name={member.full_name} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-semibold text-slate-900">{member.full_name}</p>
                {isOwner ? (
                  <Badge variant="blue" className="text-[10px] py-0 px-1.5 h-4 flex items-center gap-1">
                    <Shield size={10} /> Admin
                  </Badge>
                ) : (
                  <Badge variant="default" className="text-[10px] py-0 px-1.5 h-4 flex items-center gap-1">
                    <User size={10} /> Member
                  </Badge>
                )}
              </div>
              <p className="flex items-center gap-1 truncate text-xs text-slate-400 mt-1">
                <Mail size={10} /> {member.email}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
