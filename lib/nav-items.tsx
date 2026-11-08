import { ReactNode } from "react";
import { LayoutDashboard, TerminalSquare, History } from "lucide-react";

export const NAV_ITEMS: { href: string; label: string; icon: ReactNode }[] = [
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
        href: "/history",
        label: "History",
        icon: <History className="h-4 w-4" />,
    },
];
