import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  ChevronRight,
  Command,
  Menu,
  Search,
  Sparkles,
  X,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { navItems } from "../lib/navigation";
import Avatar from "./ui/Avatar";

export default function Topbar({ pageMeta, onMenu }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [readNotifications, setReadNotifications] = useState(false);
  const searchRef = useRef(null);
  const menuRef = useRef(null);

  const notifications = [
    {
      id: 1,
      title: "Low Inventory Alert",
      message: "Copper Wiring B reached 12 units (Low Stock threshold).",
      time: "10m ago",
      icon: AlertCircle,
      type: "warning",
    },
    {
      id: 2,
      title: "Payroll Pending",
      message: "1 employee salary in Operations awaiting review.",
      time: "45m ago",
      icon: FileCheck,
      type: "info",
    },
    {
      id: 3,
      title: "Pipeline Movement",
      message: "5 deals currently advancing in Negotiation stage ($120k).",
      time: "2h ago",
      icon: Sparkles,
      type: "success",
    },
  ];

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return navItems;
    return navItems.filter((item) =>
      `${item.label} ${item.title} ${item.description}`.toLowerCase().includes(term),
    );
  }, [query]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setActiveIndex(0);
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setOpenMenu(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!searchOpen) return undefined;
    const timer = window.setTimeout(() => searchRef.current?.focus(), 40);
    return () => window.clearTimeout(timer);
  }, [searchOpen]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const goTo = (path) => {
    navigate(path);
    setSearchOpen(false);
    setQuery("");
    setOpenMenu(null);
  };

  const onSearchKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (results.length ? (index + 1) % results.length : 0));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) =>
        results.length ? (index - 1 + results.length) % results.length : 0,
      );
    }
    if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();
      goTo(results[activeIndex].path);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-line/80 bg-void/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenu}
          className="rounded-xl p-2 text-muted transition-colors duration-200 hover:bg-shell hover:text-ink lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm">
          <span className="hidden text-slate-500 sm:inline">Workspace</span>
          <ChevronRight size={14} className="hidden text-slate-700 sm:block" />
          <span className="truncate font-medium text-slate-200">{pageMeta.title}</span>
          {pageMeta.subpath ? (
            <>
              <ChevronRight size={14} className="text-slate-700" />
              <span className="truncate text-xs font-medium text-accent">{pageMeta.subpath}</span>
            </>
          ) : null}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveIndex(0);
              setSearchOpen(true);
            }}
            className="flex h-9 items-center gap-2 rounded-xl border border-line bg-shell/70 px-2.5 text-xs text-muted transition-colors duration-200 hover:border-slate-500/60 hover:bg-raised/70 hover:text-slate-200 sm:w-56 sm:px-3"
            aria-label="Search workspace (Cmd+K)"
          >
            <Search size={15} />
            <span className="hidden sm:inline">Search workspace...</span>
            <kbd className="ml-auto hidden items-center gap-0.5 rounded-md border border-line bg-void/60 px-1.5 py-0.5 text-[9px] text-muted sm:flex">
              <Command size={9} />K
            </kbd>
          </button>

          <div ref={menuRef} className="flex items-center gap-1.5">
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenMenu((current) => (current === "notifications" ? null : "notifications"))
                }
                className="relative rounded-xl p-2 text-muted transition-colors duration-200 hover:bg-shell hover:text-ink"
                aria-label="Notifications"
                aria-haspopup="menu"
                aria-expanded={openMenu === "notifications"}
              >
                <Bell size={18} />
                {!readNotifications ? (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-void" />
                ) : null}
              </button>

              {openMenu === "notifications" ? (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-80 origin-top-right animate-scale-in overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl shadow-black/60 z-50"
                >
                  <div className="flex items-center justify-between border-b border-line/80 px-4 py-3 bg-shell/50">
                    <div>
                      <p className="text-xs font-semibold text-ink">Workspace Activity</p>
                      <p className="mt-0.5 text-[10px] text-muted">
                        Live alerts and pipeline updates
                      </p>
                    </div>
                    {!readNotifications ? (
                      <button
                        type="button"
                        onClick={() => setReadNotifications(true)}
                        className="text-[10px] text-accent hover:underline"
                      >
                        Mark all read
                      </button>
                    ) : null}
                  </div>

                  {!readNotifications ? (
                    <div className="divide-y divide-line/60">
                      {notifications.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.id}
                            className="flex items-start gap-3 p-3.5 hover:bg-raised/40 transition-colors"
                          >
                            <span
                              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs ${
                                item.type === "warning"
                                  ? "border-amber-400/25 bg-amber-400/10 text-amber-300"
                                  : item.type === "info"
                                    ? "border-indigo-400/25 bg-indigo-400/10 text-indigo-300"
                                    : "border-accent/25 bg-accent/10 text-accent"
                              }`}
                            >
                              <Icon size={14} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-medium text-slate-200">{item.title}</p>
                                <span className="text-[10px] text-slate-500">{item.time}</span>
                              </div>
                              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                                {item.message}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center px-5 py-8 text-center">
                      <span className="rounded-full border border-line bg-shell p-2 text-muted">
                        <Check size={16} />
                      </span>
                      <p className="mt-3 text-xs font-medium text-slate-300">You're all caught up</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                        New insights and operations events will stream here.
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenMenu((current) => (current === "profile" ? null : "profile"))
                }
                className="flex items-center gap-2 rounded-xl p-1 pr-1.5 transition-colors duration-200 hover:bg-shell sm:pr-2.5"
                aria-label="Open profile menu"
                aria-haspopup="menu"
                aria-expanded={openMenu === "profile"}
              >
                <Avatar name="Acme Admin" size="sm" />
                <span className="hidden text-left xl:block">
                  <span className="block text-xs font-medium text-slate-200">Admin</span>
                  <span className="block text-[10px] text-muted">Acme Intelligence</span>
                </span>
              </button>

              {openMenu === "profile" ? (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-64 origin-top-right animate-scale-in overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl shadow-black/60 z-50"
                >
                  <div className="flex items-center gap-3 border-b border-line/80 px-4 py-3.5 bg-shell/40">
                    <Avatar name="Acme Admin" size="md" />
                    <div>
                      <p className="text-xs font-semibold text-ink">Acme Administrator</p>
                      <p className="mt-0.5 text-[11px] text-muted">admin@acme-corp.com</p>
                    </div>
                  </div>
                  <div className="space-y-2.5 px-4 py-3.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-muted">Workspace role</span>
                      <span className="font-medium text-slate-300">Executive Lead</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted">Environment</span>
                      <span className="text-slate-400">Production (Local)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted">Data streaming</span>
                      <span className="inline-flex items-center gap-1.5 text-emerald-300 font-medium">
                        <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
                        Connected
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {searchOpen ? (
        <div
          className="fixed inset-0 z-[60] flex animate-fade-in items-start justify-center bg-void/70 px-4 pt-20 backdrop-blur-sm sm:pt-28"
          onMouseDown={() => setSearchOpen(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search workspace"
            className="w-full max-w-xl animate-scale-in overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl shadow-black/70"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-line/80 px-4 bg-shell/50">
              <Search size={18} className="text-muted" />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={onSearchKeyDown}
                placeholder="Jump to a workspace page or analytics module..."
                className="h-14 flex-1 bg-transparent text-sm text-ink placeholder:text-slate-500 focus:outline-none"
                aria-label="Search pages"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded-lg p-1.5 text-muted transition-colors duration-200 hover:bg-shell hover:text-ink"
                aria-label="Close search"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[340px] overflow-y-auto p-2">
              {results.length ? (
                results.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => goTo(item.path)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors duration-200 ${
                        index === activeIndex ? "bg-shell border border-line/80" : "hover:bg-shell/60 border border-transparent"
                      }`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-void/60 text-accent">
                        <Icon size={17} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-slate-200">
                          {item.title}
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] text-muted">
                          {item.description}
                        </span>
                      </span>
                      {location.pathname === item.path ? (
                        <span className="rounded-md border border-accent/30 bg-accent/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-accent">
                          Active
                        </span>
                      ) : (
                        <ChevronRight size={14} className="text-slate-600" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="flex flex-col items-center px-6 py-10 text-center">
                  <Sparkles size={20} className="text-slate-500" />
                  <p className="mt-3 text-sm font-medium text-slate-300">No matching views found</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Try searching for financials, employees, intelligence, or compliance.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-line/80 px-4 py-2.5 text-[10px] text-slate-500 bg-void/40">
              <span>Use ↑ ↓ keys to navigate</span>
              <span>Press Enter to select · Esc to close</span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
