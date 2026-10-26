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
  SidebarHeader,
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
import inventoryIcon from "@/assets/icon-jpj-4.svg";


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
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="hover:bg-transparent">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <img
                    src={inventoryIcon}
                    alt="Logo de Almacén JPJ"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Almacén JPJ</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
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
