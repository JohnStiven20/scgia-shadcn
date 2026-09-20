import { TopBar } from "@/components/TopBar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthAccess } from "@/features/auth/hooks/useAuthAccess"
import {
  ArrowDownToLine,
  ArrowUpToLine,
  Boxes,
  ChevronDown,
  CornerUpLeft,
  History,
  PackageSearch,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import { INVENTORY_PERMISSIONS } from "../permissions"

export function InventoryTopNav() {
  const navigate = useNavigate()
  const { hasPermission } = useAuthAccess()

  const canCreateEntry = hasPermission(INVENTORY_PERMISSIONS.ENTRY_CREATE)
  const canCreateAssignment = hasPermission(
    INVENTORY_PERMISSIONS.ASSIGNMENT_CREATE
  )
  const canCreateReturn = hasPermission(INVENTORY_PERMISSIONS.RETURN_CREATE)
  const canCreateExit = hasPermission(INVENTORY_PERMISSIONS.EXIT_CREATE)
  const canViewModels = hasPermission(INVENTORY_PERMISSIONS.MODEL_VIEW)
  const canViewProducts = hasPermission(INVENTORY_PERMISSIONS.PRODUCT_VIEW)
  const canViewTraceability = hasPermission(
    INVENTORY_PERMISSIONS.TRACEABILITY_VIEW
  )
  const canViewOperations =
    canCreateEntry || canCreateExit || canCreateReturn || canCreateAssignment

  return (
    <TopBar>
      <nav
        aria-label="Navegacion de inventario"
        className="flex min-w-max items-center gap-1 whitespace-nowrap"
      >
        {canViewOperations ? (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" />}>
              Operaciones <ChevronDown />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {canCreateEntry ? (
                <DropdownMenuItem onClick={() => navigate("/inventory/entry")}>
                  <ArrowDownToLine />
                  Entradas
                </DropdownMenuItem>
              ) : null}
              {canCreateExit ? (
                <DropdownMenuItem onClick={() => navigate("/inventory/out")}>
                  <ArrowUpToLine />
                  Salidas
                </DropdownMenuItem>
              ) : null}
              {canCreateReturn ? (
                <DropdownMenuItem onClick={() => navigate("/inventory/return")}>
                  <CornerUpLeft />
                  Retornos
                </DropdownMenuItem>
              ) : null}
              {canCreateAssignment ? (
                <DropdownMenuItem
                  onClick={() => navigate("/inventory/assignment")}
                >
                  <CornerUpLeft />
                  Asignaciones
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
        {canViewModels ? (
          <Button variant="ghost" onClick={() => navigate("/inventory/models")}>
            <Boxes />
            Modelos
          </Button>
        ) : null}
        {canViewProducts ? (
          <Button
            variant="ghost"
            onClick={() => navigate("/inventory/products")}
          >
            <PackageSearch />
            Productos
          </Button>
        ) : null}
        {canViewTraceability ? (
          <Button
            variant="ghost"
            onClick={() => navigate("/inventory/traceability")}
          >
            <History />
            Trazabilidad
          </Button>
        ) : null}
      </nav>
    </TopBar>
  )
}
