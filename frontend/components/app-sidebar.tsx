"use client"

import { useState, useEffect } from "react"
import {
  Frame,
  Map,
  PieChart,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
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
      case "orgAdmin":
        mapped = "organization"
        break
      case "superAdmin":
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

  const projects = [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser user={user as any} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={projects} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
