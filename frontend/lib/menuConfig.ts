import {
  LayoutDashboard,
  Swords,
  Users,
  Folder,
  UserCircle,
  MessageSquare,
  Settings2,
  FileText,
  BarChart3,
  LucideIcon,
} from "lucide-react";

export type UserRole = "student" | "mentor" | "organization" | "admin";

export type MenuItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  // Optional nested items if you need collapsible groups in future
  items?: Array<{ title: string; url: string }>;
};

export type RoleMenuConfig = Record<UserRole, MenuItem[]>;

export const roleMenus: RoleMenuConfig = {
  student: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Challenges", url: "/challenges", icon: Swords },
    { title: "Teams", url: "/teams", icon: Users },
    { title: "Projects", url: "/projects", icon: Folder },
    { title: "Profile", url: "/profile", icon: UserCircle },
    { title: "Chat", url: "/chat", icon: MessageSquare },
    { title: "Setting", url: `/setting`, icon: Settings2}
  ],
  mentor: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Assigned Teams", url: "/mentor/teams", icon: Users },
    { title: "Challenges", url: "/challenges", icon: Swords },
    { title: "Submissions", url: "/mentor/submissions", icon: FileText },
    { title: "Profile", url: "/profile", icon: UserCircle },
    { title: "Chat", url: "/chat", icon: MessageSquare },
    { title: "Setting", url: `/setting`, icon: Settings2}
  ],
  organization: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Hosted Challenges", url: "/org/challenges", icon: Swords },
    { title: "Reports", url: "/org/reports", icon: BarChart3 },
    { title: "Teams", url: "/teams", icon: Users },
    { title: "Profile", url: "/profile", icon: UserCircle },
    { title: "Setting", url: `/setting`, icon: Settings2}
  ],
  admin: [
    { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
    { title: "Users", url: "/admin/users", icon: Users },
    { title: "Challenges", url: "/admin/challenges", icon: Swords },
    { title: "Reports", url: "/admin/reports", icon: BarChart3 },
    { title: "Setting", url: `/setting`, icon: Settings2}
  ],
};
