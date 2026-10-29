import { DollarSign, LayoutDashboard, LineChart, ShieldCheck, Users } from "lucide-react";

export const navItems = [
  {
    path: "/",
    label: "Overview",
    title: "Executive overview",
    description: "A live snapshot of revenue, clients, pipeline, and operations.",
    icon: LayoutDashboard,
  },
  {
    path: "/business-intelligence",
    label: "Intelligence",
    title: "Business intelligence",
    description: "Turn product and client signals into confident decisions.",
    icon: LineChart,
  },
  {
    path: "/financials",
    label: "Financials",
    title: "Financial analytics",
    description: "Track profitability, operating costs, and market movement.",
    icon: DollarSign,
  },
  {
    path: "/employees",
    label: "Employees",
    title: "People & payroll",
    description: "Manage compensation, performance, and department health.",
    icon: Users,
  },
  {
    path: "/compliance",
    label: "Compliance",
    title: "AI compliance copilot",
    description: "Simulate changes, track evidence, and document human oversight.",
    icon: ShieldCheck,
  },
];

export function getPageMeta(pathname) {
  const exact = navItems.find((item) => item.path === pathname);
  if (exact) return exact;
  const section = navItems.find(
    (item) => item.path !== "/" && pathname.startsWith(`${item.path}/`),
  );
  return section ?? navItems[0];
}
