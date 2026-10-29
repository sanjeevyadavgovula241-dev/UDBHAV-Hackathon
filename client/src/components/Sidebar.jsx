import { Link, NavLink } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { navItems } from "../lib/navigation";

export default function Sidebar({ collapsed, onToggle, mobileOpen, onClose }) {
  // Group nav items by section
  const workspaceItems = navItems.filter((item) => item.section === "Workspace" || !item.section);
  const governanceItems = navItems.filter((item) => item.section === "Governance");

  const renderNavGroup = (title, items) => (
    <div className="mb-5 last:mb-0">
      <div
        className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 transition-all duration-200 ${
          collapsed ? "lg:h-0 lg:overflow-hidden lg:opacity-0" : "opacity-100"
        }`}
      >
        {title}
      </div>
      <nav className="space-y-1" aria-label={title}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={onClose}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl border px-2.5 py-2 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent/70 ${
                  collapsed ? "lg:justify-center lg:px-2" : ""
                } ${
                  isActive
                    ? "border-accent/25 bg-accent/[0.08] text-ink shadow-[0_2px_12px_-4px_rgba(85,214,190,0.2)]"
                    : "border-transparent text-muted hover:border-line/60 hover:bg-raised/60 hover:text-ink"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 ${
                      isActive
                        ? "bg-accent/15 text-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                        : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                  </span>
                  <span
                    className={`min-w-0 flex-1 overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300 ${
                      collapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"
                    }`}
                  >
                    {item.label}
                  </span>

                  {item.badge && !collapsed ? (
                    <span className="rounded-md border border-accent/30 bg-accent/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-accent">
                      {item.badge}
                    </span>
                  ) : null}

                  <span
                    className={`ml-auto h-4 w-1 rounded-full bg-accent transition-all duration-200 ${
                      isActive ? "opacity-100" : "opacity-0"
                    } ${collapsed ? "lg:hidden" : ""}`}
                  />
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-void/80 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        aria-label="Primary navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-line bg-shell/95 backdrop-blur-xl transition-[width,transform] duration-300 ease-out lg:translate-x-0 ${
          collapsed ? "lg:w-[76px]" : "lg:w-[264px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-line/80 px-4">
          <Link
            to="/"
            onClick={onClose}
            className="flex min-w-0 items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-accent/70 rounded-xl"
            aria-label="Acme Intelligence Home"
          >
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-accent/30 bg-surface font-display text-sm font-bold text-accent shadow-[inset_0_1px_0_rgba(241,245,249,0.05),0_0_15px_-3px_rgba(85,214,190,0.25)]">
              A
            </span>
            <span
              className={`overflow-hidden transition-all duration-300 ${
                collapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"
              }`}
            >
              <span className="block whitespace-nowrap font-display text-sm font-semibold tracking-[0.16em] text-ink">
                ACME
              </span>
              <span className="block whitespace-nowrap text-[9px] uppercase tracking-[0.22em] text-muted">
                Intelligence
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-lg p-1.5 text-muted transition-colors duration-200 hover:bg-raised hover:text-ink lg:hidden"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto px-3 py-5 ${collapsed ? "lg:px-2" : ""}`}>
          {renderNavGroup("Analytics & Workspace", workspaceItems)}
          {renderNavGroup("Governance & Trust", governanceItems)}
        </div>

        <div className="shrink-0 space-y-3 border-t border-line/80 p-3">
          <div
            className={`overflow-hidden rounded-xl border border-line bg-void/50 transition-all duration-300 ${
              collapsed ? "lg:h-0 lg:border-0 lg:p-0 lg:opacity-0" : "p-3 opacity-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse-soft rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-300">
                Live sync active
              </span>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
              Pipeline, finance, and people records updating in real time.
            </p>
          </div>

          <button
            type="button"
            onClick={onToggle}
            className={`hidden w-full items-center gap-2 rounded-xl border border-transparent px-2.5 py-2 text-xs font-medium text-muted transition-colors duration-200 hover:border-line hover:bg-raised/60 hover:text-ink lg:flex ${
              collapsed ? "justify-center" : ""
            }`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            <span className={`overflow-hidden whitespace-nowrap ${collapsed ? "lg:hidden" : ""}`}>
              Collapse sidebar
            </span>
            <kbd
              className={`ml-auto text-[9px] text-slate-600 border border-line rounded px-1 py-0.5 ${
                collapsed ? "lg:hidden" : ""
              }`}
            >
              ⌘B
            </kbd>
          </button>

          <div
            className={`flex items-center justify-between px-2 text-[10px] uppercase tracking-[0.16em] text-slate-500 ${
              collapsed ? "lg:justify-center" : ""
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
              <span className={collapsed ? "lg:hidden" : ""}>Production</span>
            </span>
            <span className={`text-[9px] text-slate-600 ${collapsed ? "lg:hidden" : ""}`}>
              v1.2.0
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
