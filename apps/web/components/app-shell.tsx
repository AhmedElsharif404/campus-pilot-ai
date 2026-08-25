"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookMarked,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  CheckSquare2,
  FileUp,
  GraduationCap,
  LayoutList,
  Menu,
  Settings,
  Wand2,
  X,
} from "lucide-react";
import { useState, useSyncExternalStore } from "react";

const nav = [
  { label: "Today", href: "/app/today", icon: LayoutList },
  { label: "Semester", href: "/app", icon: GraduationCap },
  { label: "Calendar", href: "/app/calendar", icon: CalendarDays },
  { label: "Assignments", href: "/app/assignments", icon: CheckSquare2 },
  { label: "Study plan", href: "/app/study-plan", icon: BookMarked },
  {
    label: "Progress",
    href: "/app/progress",
    icon: ChartNoAxesColumnIncreasing,
  },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const online = useSyncExternalStore(
    (notify) => {
      window.addEventListener("online", notify);
      window.addEventListener("offline", notify);
      return () => {
        window.removeEventListener("online", notify);
        window.removeEventListener("offline", notify);
      };
    },
    () => navigator.onLine,
    () => true,
  );

  return (
    <div className="workspace-shell">
      <header className="mobile-header">
        <Link className="wordmark" href="/app/today">
          <span className="wordmark-seal">CP</span>
          <span>CampusPilot</span>
        </Link>
        <button
          className="icon-button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="workspace-navigation"
          aria-label="Toggle navigation"
        >
          {open ? <X /> : <Menu />}
        </button>
      </header>
      <aside
        id="workspace-navigation"
        className={`workspace-sidebar ${open ? "is-open" : ""}`}
      >
        <div className="sidebar-top">
          <Link className="wordmark" href="/app/today">
            <span className="wordmark-seal">CP</span>
            <span>
              CampusPilot <em>AI</em>
            </span>
          </Link>
          <div className="term-switcher">
            <span>Current semester</span>
            <button>
              Fall 2026 <span aria-hidden="true">⌄</span>
            </button>
          </div>
          <nav className="workspace-nav" aria-label="Workspace navigation">
            {nav.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/app"
                  ? pathname === "/app"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  className={active ? "active" : ""}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="sidebar-divider" />
          <Link className="intake-link" href="/app/upload">
            <FileUp size={18} />
            <span>Import syllabus</span>
            <span className="kbd">N</span>
          </Link>
          <Link className="review-link" href="/app/review/demo">
            <Wand2 size={18} />
            <span>
              <strong>Review extraction</strong>
              <small>6 fields need attention</small>
            </span>
            <span className="review-count">6</span>
          </Link>
        </div>
        <div className="sidebar-bottom">
          {!online && (
            <div className="offline-notice" role="status">
              Offline · changes will sync later
            </div>
          )}
          <Link className="profile-link" href="/app/settings">
            <span className="avatar" aria-hidden="true">
              AR
            </span>
            <span>
              <strong>Alex Rivera</strong>
              <small>alex@northbridge.edu</small>
            </span>
            <Settings size={17} />
          </Link>
        </div>
      </aside>
      <main id="main-content" className="workspace-main">
        {children}
      </main>
      <nav className="mobile-tabs" aria-label="Mobile workspace navigation">
        {nav.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              className={active ? "active" : ""}
              href={item.href}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={20} />
              <span>
                {item.label === "Assignments"
                  ? "Tasks"
                  : item.label === "Study plan"
                    ? "Plan"
                    : item.label}
              </span>
            </Link>
          );
        })}
      </nav>
      {open && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
