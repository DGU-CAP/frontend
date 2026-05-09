"use client";

import { Bell } from "lucide-react";
import { useState } from "react";
import { useAlertStore } from "../store/useAlertStore";
import { Badge } from "../../components/ui/badge";

export default function Header() {
  const { alerts, unreadCount, markAllRead } = useAlertStore();
  const [open, setOpen] = useState(false);

  function handleBellClick() {
    setOpen((v) => !v);
    if (!open) markAllRead();
  }

  return (
    <header className="h-16 shrink-0 border-b border-gray-800 bg-gray-900 flex items-center justify-end px-6 relative">
      <button
        onClick={handleBellClick}
        className="relative p-2 rounded-md hover:bg-gray-800 transition-colors"
        aria-label="알람"
      >
        <Bell size={20} className="text-gray-300" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </button>

      {open && (
        <div className="absolute top-14 right-4 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
          <div className="p-3 border-b border-gray-700 text-sm font-semibold text-gray-200">
            최근 알람
          </div>
          {alerts.length === 0 ? (
            <div className="p-4 text-sm text-gray-400 text-center">
              알람이 없습니다
            </div>
          ) : (
            <ul className="max-h-72 overflow-y-auto divide-y divide-gray-800">
              {alerts.map((a, i) => (
                <li key={i} className="p-3 text-sm">
                  <span className="font-medium text-white">{a.podName}</span>
                  <span className="ml-2 text-gray-400">{a.anomalyType}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </header>
  );
}
