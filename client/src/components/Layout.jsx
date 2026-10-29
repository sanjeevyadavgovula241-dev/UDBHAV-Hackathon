import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import VoiceCopilotWidget from "./copilot/VoiceCopilotWidget";
import { getPageMeta } from "../lib/navigation";

export default function Layout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem("acme:sidebar-collapsed") === "true";
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const pageMeta = getPageMeta(location.pathname);

  useEffect(() => {
    try {
      window.localStorage.setItem("acme:sidebar-collapsed", String(collapsed));
    } catch {
      return undefined;
    }
    return undefined;
  }, [collapsed]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        setCollapsed((value) => !value);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="relative min-h-screen bg-void text-slate-200">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute -top-52 left-[24%] h-[560px] w-[760px] -translate-x-1/2 rounded-full bg-accent/[0.05] blur-[150px]" />
        <div className="absolute -bottom-40 right-[-6%] h-[460px] w-[560px] rounded-full bg-indigo-500/[0.035] blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(139,155,180,0.022)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,155,180,0.022)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_74%)]" />
      </div>

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div
        className={`relative z-10 flex min-h-screen flex-col transition-[padding] duration-300 ease-out ${
          collapsed ? "lg:pl-[76px]" : "lg:pl-[264px]"
        }`}
      >
        <Topbar pageMeta={pageMeta} onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div key={location.pathname} className="page-enter mx-auto w-full max-w-[1560px]">
            <Outlet />
          </div>
        </main>

        {/* Global Floating AI Voice Command & Instant Report Generator Assistant */}
        <VoiceCopilotWidget />
      </div>
    </div>
  );
}
