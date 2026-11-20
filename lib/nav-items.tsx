import { ReactNode } from "react";
import {
  LayoutDashboard,
  TerminalSquare,
  History,
  BarChart2,
  FlaskConical,
  Layers,
  ShieldAlert,
  Play,
  Regex,
} from "lucide-react";

export const NAV_ITEMS: { href: string; label: string; icon: ReactNode; badge?: string }[] = [
  {
    href: "/",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    href: "/analyzer",
    label: "Bug Analyzer",
    icon: <TerminalSquare className="h-4 w-4" />,
  },
  {
    href: "/stack-lens",
    label: "Stack Lens",
    icon: <Layers className="h-4 w-4" />,
    badge: "New",
  },
  {
    href: "/security",
    label: "Security Guard",
    icon: <ShieldAlert className="h-4 w-4" />,
    badge: "New",
  },
  {
    href: "/sandbox",
    label: "Code Sandbox",
    icon: <Play className="h-4 w-4" />,
    badge: "New",
  },
  {
    href: "/regex",
    label: "Regex Studio",
    icon: <Regex className="h-4 w-4" />,
    badge: "New",
  },
  {
    href: "/history",
    label: "History",
    icon: <History className="h-4 w-4" />,
  },
  {
    href: "/stats",
    label: "Analytics",
    icon: <BarChart2 className="h-4 w-4" />,
  },
  {
    href: "/playground",
    label: "API Console",
    icon: <FlaskConical className="h-4 w-4" />,
  },
];
