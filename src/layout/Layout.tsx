import {
  Boxes,
  CalendarX2,
  LayoutDashboard,
  ShieldCheck,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react"
import { useEffect } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useAuthAccess } from "@/features/auth/hooks/useAuthAccess"
import {
  getAccessibleNavigationItems,
  type AuthorizedNavigationItem,
} from "@/features/auth/utils/authorized-navigation"

type WorkspaceMenu = {
  title: string
  icon: LucideIcon
  href: string
}

const workspaceMenuIcons: Record<string, LucideIcon> = {
  Admin: ShieldCheck,
  Inventario: Boxes,
  Trabajadores: Users,
  Ausencias: CalendarX2,
  Flota: Truck,
}

function toWorkspaceMenu(item: AuthorizedNavigationItem): WorkspaceMenu {
  return {
    title: item.title,
    icon: workspaceMenuIcons[item.title] ?? LayoutDashboard,
    href: item.href,
  }
}

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export const AppLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { permissions } = useAuthAccess()
  const workspaceMenus = getAccessibleNavigationItems(permissions).map(
    toWorkspaceMenu
  )

  return (
    <SidebarProvider>
      <ScrollToTop />
      <Sidebar collapsible="icon" variant="floating">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Espacio de trabajo</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {workspaceMenus.map((menu) => (
                  <SidebarMenuItem key={menu.title}>
                    <SidebarMenuButton
                      tooltip={menu.title}
                      isActive={location.pathname.startsWith(menu.href)}
                      onClick={() => navigate(menu.href)}
                    >
                      <menu.icon />
                      <span>{menu.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
