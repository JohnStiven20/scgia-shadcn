import { ShieldCheck, UsersRound } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

import { TopBar } from "@/components/TopBar"
import { Button } from "@/components/ui/button"

export function AdminTopNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <TopBar>
      <nav
        aria-label="Navegacion de administracion"
        className="flex min-w-max items-center gap-1 whitespace-nowrap"
      >
        <Button
          variant={location.pathname.startsWith("/admin/users") ? "secondary" : "ghost"}
          onClick={() => navigate("/admin/users")}
        >
          <UsersRound />
          Usuarios
        </Button>
        <Button
          variant={location.pathname.startsWith("/admin/roles") ? "secondary" : "ghost"}
          onClick={() => navigate("/admin/roles")}
        >
          <ShieldCheck />
          Roles
        </Button>
      </nav>
    </TopBar>
  )
}

