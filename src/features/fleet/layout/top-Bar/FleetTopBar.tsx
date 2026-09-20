import { useNavigate } from "react-router-dom"

import { TopBar } from "@/components/TopBar"
import { Button } from "@/components/ui/button"
import { useAuthAccess } from "@/features/auth/hooks/useAuthAccess"

export const FleetTopBar = () => {
  const navigate = useNavigate()
  const { hasPermission } = useAuthAccess()
  const canViewVehicles = hasPermission("fleet.vehicle.view")
  const canViewBrands = hasPermission("fleet.brand.view")
  const canViewModels = hasPermission("fleet.model.view")

  return (
    <TopBar>
      <nav className="flex min-w-max items-center gap-1 whitespace-nowrap">
        {canViewVehicles ? (
          <Button
            variant="ghost"
            onClick={() => {
              navigate("/fleet")
            }}
          >
            Flota
          </Button>
        ) : null}
        {canViewBrands ? (
          <Button variant="ghost" onClick={() => {}}>
            Marcas
          </Button>
        ) : null}
        {canViewModels ? (
          <Button variant="ghost" onClick={() => {}}>
            Modelos
          </Button>
        ) : null}
      </nav>
    </TopBar>
  )
}
