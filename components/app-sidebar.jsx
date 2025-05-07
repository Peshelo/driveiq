"use client"

import * as React from "react"
import {
  Car,
  ClipboardCheck,
  Clock,
  FileText,
  Home,
  ListChecks,
  Settings2,
  ShieldAlert,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import pb from "@/lib/connection"

const data = {
  teams: [
    {
      name: `Travis Driving School`,
      logo: Car,
      plan: "Demo",
    },
    {
      name: `Travis Driving School - Pro`,
      logo: ShieldAlert,
      plan: "Pro",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home
    },
    {
      title: "Tests",
      icon: ClipboardCheck,
      isDemo: true,
      items: [
        {
          title: "Manage Tests",
          url: "/admin/tests",
          isDemo: true,
        },
        {
          title: "Take Test",
          url: "/admin/tests/take-test",
          isDemo: true,
        },
        {
          title: "Practice Tests",
          url: "/admin/pro-feature",
          isPro: true,
          badge: "Pro",
        },
      ],
    },
    {
      title: "Students",
      icon: Users,
      isPro: true,
      items: [
        {
          title: "Manage Students",
          url: "/admin/students",
          isPro: true,
          badge: "Pro",
        },
        {
          title: "Progress Reports",
          url: "/admin/pro-feature",
          isPro: true,
          badge: "Pro",
        },
      ],
    },
    // {
    //   title: "Scheduling",
    //   icon: Clock,
    //   isPro: true,
    //   items: [
    //     {
    //       title: "Book Lessons",
    //       url: "/admin/pro-feature",
    //       isPro: true,
    //       badge: "Pro",
    //     },
    //     {
    //       title: "Instructor Calendar",
    //       url: "/admin/pro-feature",
    //       isPro: true,
    //       badge: "Pro",
    //     },
    //   ],
    // },
    // {
    //   title: "Regulations",
    //   icon: FileText,
    //   isPro: true,
    //   items: [
    //     {
    //       title: "Traffic Laws",
    //       url: "/admin/pro-feature",
    //       isPro: true,
    //       badge: "Pro",
    //     },
    //     {
    //       title: "Test Requirements",
    //       url: "/admin/pro-feature",
    //       isPro: true,
    //       badge: "Pro",
    //     },
    //   ],
    // },
    // {
    //   title: "Settings",
    //   icon: Settings2,
    //   items: [
    //     {
    //       title: "Account",
    //       url: "/settings",
    //       isDemo: true,
    //     },
    //     {
    //       title: "Payment Methods",
    //       url: "/admin/pro-feature",
    //       isPro: true,
    //       badge: "Pro",
    //     },
    //   ],
    // },
  ],
  proFeatures: [
    {
      name: "Student Finances",
      url: "/admin/pro-feature",
      icon: Users,
      badge: "Pro",
    },
    {
      name: "Instructor Tools",
      url: "/admin/pro-feature",
      icon: ListChecks,
      badge: "Pro",
    },
    {
      name: "Fleet Management",
      url: "/admin/pro-feature",
      icon: Car,
      badge: "Pro",
    },
  ],
}

export function AppSidebar({ ...props }) {
  const [user, setUser] = React.useState({
    name: "",
    email: "",
    avatar: "/avatars/default.jpg",
  });

  const fetchUserDetails = () => {
    try {
      const model = pb.authStore.model;
      setUser({
        name: model.name || "Student",
        email: model.email || "student@example.com",
        avatar: model.avatar || "/avatars/default.jpg",
      });
    } catch (e) {
      toast.error("Failed to load user details");
      console.error(e);
    }
  }

  React.useEffect(() => {
    fetchUserDetails();
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain.map(item => ({
          ...item,
          items: item.items?.map(subItem => ({
            ...subItem,
            disabled: subItem.isPro,
            badge: subItem.isPro ? <Badge variant="premium">Pro</Badge> : null
          })),
          disabled: item.isPro,
          badge: item.isPro ? <Badge variant="premium">Pro</Badge> : null
        }))} />
        
        <div className="mt-6">
          <h3 className="px-4 mb-2 text-sm font-medium text-muted-foreground">
            Pro Features
          </h3>
          <NavProjects projects={data.proFeatures.map(project => ({
            ...project,
            disabled: true,
            badge: <Badge variant="premium">Pro</Badge>
          }))} />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}