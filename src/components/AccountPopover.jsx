// src/components/AccountPopover.jsx
import React, { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Copy, LogOut, User2 } from "lucide-react";

function Initials({ text }) {
  const initials = (text || "—")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
  return (
    <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center font-semibold">
      {initials || <User2 className="h-4 w-4" />}
    </div>
  );
}

export default function AccountPopover({ profile, isAdmin, onLogout }) {
  const [open, setOpen] = useState(false);

  const displayName = profile?.ownerName || profile?.centerName || "—";

  return (
    <Popover>
      <PopoverTrigger>
        <button
          className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
          onClick={() => setOpen(!open)}
        >
          <Initials text={displayName} />
        </button>
      </PopoverTrigger>

      {open && (
        <PopoverContent className="p-4 space-y-4 rounded-xl">
          <div className="flex items-center gap-3">
            <Initials text={displayName} />
            <div className="min-w-0">
              <div className="font-semibold truncate">{displayName}</div>
              <div className="text-xs text-white/70 truncate">{profile?.email || "—"}</div>
              <div className="text-xs text-white/70 truncate">{profile?.phone || "—"}</div>
            </div>
          </div>

          <div className="text-sm space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-white/70">Center ID</span>
              <div className="flex items-center gap-2">
                <code className="text-xs break-all">{profile?.centerId || "—"}</code>
                {profile?.centerId && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white/60 hover:text-white"
                    onClick={() => navigator.clipboard.writeText(String(profile.centerId))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-white/70">Machine</span>
              <div className="flex items-center gap-2">
                {profile?.machineName ? (
                  <Badge variant="outline" className="border-white/20">
                    {profile.machineName}
                  </Badge>
                ) : (
                  <span>—</span>
                )}
              </div>
            </div>
          </div>

          {!isAdmin && (
            <Button className="w-full bg-white/10 hover:bg-white/20" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          )}
        </PopoverContent>
      )}
    </Popover>
  );
}
