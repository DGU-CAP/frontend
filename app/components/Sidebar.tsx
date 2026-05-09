"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Server, Ticket } from "lucide-react";

const navItems = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/pods", label: "Pod 목록", icon: Server },
  { href: "/tickets", label: "티켓", icon: Ticket },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <span className="font-bold text-lg tracking-tight">
          <span className="text-green-400">DGU</span>
          <span className="text-white">-CAP</span>
        </span>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
