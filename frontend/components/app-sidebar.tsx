"use client"

import { useState, useEffect } from "react"
import {
  Frame,
  Map,
  PieChart,
} from "lucide-react"

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user"
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { roleMenus } from "@/lib/menuConfig"
import { useAuth } from "@/context/AuthContext"

type UserRole = 'student' | 'mentor' | 'organization' | 'admin'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const [role, setRole] = useState<UserRole>("student")

  useEffect(() => {
    // Map backend roles to frontend roles
    const backendRole = user?.role
    let mapped: UserRole = "student"
    switch (backendRole) {
      case "mentor":
        mapped = "mentor"
        break
      case "organization":
        mapped = "organization"
        break
      case "admin":
        mapped = "admin"
        break
      case "student":
      default:
        mapped = "student"
        break
    }
    setRole(mapped)
  }, [user?.role])

  const navMain = roleMenus[role]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser user={user as any} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
