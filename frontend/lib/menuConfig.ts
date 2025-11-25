import {
  LayoutDashboard,
  Swords,
  Users,
  UserCircle,
  Settings2,
  BarChart3,
  LucideIcon,
  Upload,
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
    { title: "Hosted Problems", url: "/problems/hostproblem", icon: Upload },
    { title: "Problems", url: "/problems", icon: Swords },
    { title: "Teams", url: "/teams", icon: Users },
    // { title: "Projects", url: "/projects", icon: Folder },
    { title: "Profile", url: "/profile", icon: UserCircle },
    { title: "Setting", url: `/setting`, icon: Settings2}
  ],
  mentor: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Problems", url: "/problems", icon: Swords },
    { title: "Teams", url: "/teams", icon: Users },
    { title: "Profile", url: "/profile", icon: UserCircle },
    { title: "Setting", url: `/setting`, icon: Settings2},
  ],
  organization: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Hosted Problems", url: "/problems/hostproblem", icon: Upload },
    { title: "Problems", url: "/problems", icon: Swords },
    { title: "Teams", url: "/teams", icon: Users },
    { title: "Profile", url: "/profile", icon: UserCircle },
    { title: "Setting", url: `/setting`, icon: Settings2}
  ],
  admin: [
    { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
    { title: "Users", url: "/admin/users", icon: Users },
    { title: "Problems", url: "/admin/problems", icon: Swords },
    { title: "Reports", url: "/admin/reports", icon: BarChart3 },
    { title: "Setting", url: `/setting`, icon: Settings2}
  ],
};
