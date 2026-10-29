import { Bot, DollarSign, LayoutDashboard, LineChart, ShieldCheck, Users } from "lucide-react";

export const navItems = [
  {
    path: "/",
    label: "Overview",
    title: "Executive overview",
    description: "A live snapshot of revenue, clients, pipeline, and operations.",
    icon: LayoutDashboard,
    section: "Workspace",
  },
  {
    path: "/business-intelligence",
    label: "Intelligence",
    title: "Business intelligence",
    description: "Turn product and client signals into confident decisions.",
    icon: LineChart,
    section: "Workspace",
  },
  {
    path: "/financials",
    label: "Financials",
    title: "Financial analytics",
    description: "Track profitability, operating costs, and market movement.",
    icon: DollarSign,
    section: "Workspace",
  },
  {
    path: "/employees",
    label: "Employees",
    title: "People & payroll",
    description: "Manage compensation, performance, and department health.",
    icon: Users,
    section: "Workspace",
  },
  {
    path: "/compliance",
    label: "Compliance",
    title: "AI compliance copilot",
    description: "Simulate changes, track evidence, and document human oversight.",
    icon: ShieldCheck,
    section: "Governance",
    badge: "AI Copilot",
  },
  {
    path: "/reports",
    label: "Reports Chat",
    title: "Instant report generator chatbot",
    description: "Voice-driven and natural language compliance report compiler & exporter.",
    icon: Bot,
    section: "Governance",
    badge: "Instant AI",
  },
];

export function getPageMeta(pathname) {
  const exact = navItems.find((item) => item.path === pathname);
  if (exact) return exact;
  const section = navItems.find(
    (item) => item.path !== "/" && pathname.startsWith(`${item.path}/`),
  );
  if (section) {
    if (pathname.includes("/systems/")) {
      return {
        ...section,
        title: "Compliance system workspace",
        subpath: "System details",
      };
    }
    return section;
  }
  return navItems[0];
}
