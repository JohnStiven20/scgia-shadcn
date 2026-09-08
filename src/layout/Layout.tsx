import {
  BarChart3,
  Boxes,
  FolderKanban,
  LayoutDashboard,
  Settings,
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
import { Outlet, useLocation } from "react-router-dom"

const workspaceMenus = [
  { title: "Resumen", icon: LayoutDashboard },
  { title: "Empleados", icon: Users },
  { title: "Proyectos", icon: FolderKanban },
  { title: "Inventario", icon: Boxes },
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
                    <SidebarMenuButton tooltip={menu.title}>
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
