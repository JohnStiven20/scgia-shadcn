import { ShieldCheck, UsersRound } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

import { TopBar } from "@/components/TopBar"
import { Button } from "@/components/ui/button"
import { useAuthAccess } from "@/features/auth/hooks/useAuthAccess"

export function AdminTopNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { hasPermission } = useAuthAccess()
  const canViewAccounts = hasPermission("account.view")
  const canViewRoles = hasPermission("role.view")

  return (
    <TopBar>
      <nav
        aria-label="Navegacion de administracion"
        className="flex min-w-max items-center gap-1 whitespace-nowrap"
      >
        {canViewAccounts ? (
          <Button
            variant={
              location.pathname.startsWith("/admin/users")
                ? "secondary"
                : "ghost"
            }
            onClick={() => navigate("/admin/users")}
          >
            <UsersRound />
            Usuarios
          </Button>
        ) : null}
        {canViewRoles ? (
          <Button
            variant={
              location.pathname.startsWith("/admin/roles")
                ? "secondary"
                : "ghost"
            }
            onClick={() => navigate("/admin/roles")}
          >
            <ShieldCheck />
            Roles
          </Button>
        ) : null}
      </nav>
    </TopBar>
  )
}
