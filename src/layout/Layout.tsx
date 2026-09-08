import {
  BarChart3,
  Boxes,
  CalendarX2,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react"
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
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useEffect } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"

const workspaceMenus = [
  { title: "Dashboard", icon: LayoutDashboard, href: undefined },
  { title: "Admin", icon: ShieldCheck, href: undefined },
  { title: "Inventario", icon: Boxes, href: "/inventory" },
  { title: "Trabajadores", icon: Users, href: "/employees" },
  { title: "Ausencias", icon: CalendarX2, href: undefined },
  { title: "Flota", icon: Truck, href: undefined },
]

const supportMenus = [
  { title: "Analíticas", icon: BarChart3 },
  { title: "Configuración", icon: Settings },
]

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export const AppLayout = () => {
  const location = useLocation()

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
                      isActive={
                        menu.href
                          ? location.pathname.startsWith(menu.href)
                          : false
                      }
                      render={menu.href ? <Link to={menu.href} /> : undefined}
                    >
                      <menu.icon />
                      <span>{menu.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel>Soporte</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {supportMenus.map((menu) => (
                  <SidebarMenuItem key={menu.title}>
                    <SidebarMenuButton tooltip={menu.title}>
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
