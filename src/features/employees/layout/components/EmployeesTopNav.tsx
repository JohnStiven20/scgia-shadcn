import { TopBar } from "@/components/TopBar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowDownToLine,
  ArrowUpToLine,
  ChevronDown,
  CornerUpLeft,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

export const EmployeesTopNav = () => {
  const navigate = useNavigate()

  return (
    <TopBar>
      <nav className="flex min-w-max items-center gap-1 whitespace-nowrap">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" />}>
            Operaciones <ChevronDown />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => {
                navigate("/inventory/entry")
              }}
            >
              <ArrowDownToLine />
              Entradas
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                navigate("/inventory/out")
              }}
            >
              <ArrowUpToLine />
              Salidas
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                navigate("/inventory/return")
              }}
            >
              <CornerUpLeft />
              Retornos
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                navigate("/inventory/assignment")
              }}
            >
              <CornerUpLeft />
              Asignaciones
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          onClick={() => {
            navigate("/inventory/models")
          }}
        >
          Modelos
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            navigate("/inventory/products")
          }}
        >
          Productos
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            navigate("/inventory")
          }}
        >
          Trazabilidad
        </Button>
      </nav>
    </TopBar>
  )
}
