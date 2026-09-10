import { TopBar } from "@/components/TopBar"
import { Button } from "@/components/ui/button"
import { CalendarDays, ClipboardList, Settings2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function AbsencesTopBar() {
  const navigate = useNavigate()

  return (
    <TopBar>
      <nav aria-label="Navegación de ausencias" className="flex min-w-max items-center gap-1 whitespace-nowrap">
        <Button variant="ghost" onClick={() => navigate("/absences/my-absences")}>
          <CalendarDays />
          Ausencias
        </Button>
        <Button variant="ghost" onClick={() => navigate("/absences/requests")}>
          <ClipboardList />
          Peticiones
        </Button>
        <Button variant="ghost" onClick={() => navigate("/absences/types")}>
          <Settings2 />
          Tipos de ausencia
        </Button>
      </nav>
    </TopBar>
  )
}
