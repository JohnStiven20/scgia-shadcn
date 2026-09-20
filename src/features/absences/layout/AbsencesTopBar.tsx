import { TopBar } from "@/components/TopBar"
import { Button } from "@/components/ui/button"
import { useAuthAccess } from "@/features/auth/hooks/useAuthAccess"
import { CalendarDays, ClipboardList, Settings2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function AbsencesTopBar() {
  const navigate = useNavigate()
  const { hasPermission } = useAuthAccess()
  const canViewOwnAbsences = hasPermission("absence.own.view")
  const canViewRequests = hasPermission("absence.management.view")
  const canViewTypes = hasPermission("absence.type.view")

  return (
    <TopBar>
      <nav
        aria-label="Navegacion de ausencias"
        className="flex min-w-max items-center gap-1 whitespace-nowrap"
      >
        {canViewOwnAbsences ? (
          <Button
            variant="ghost"
            onClick={() => navigate("/absences/my-absences")}
          >
            <CalendarDays />
            Ausencias
          </Button>
        ) : null}
        {canViewRequests ? (
          <Button variant="ghost" onClick={() => navigate("/absences/requests")}>
            <ClipboardList />
            Peticiones
          </Button>
        ) : null}
        {canViewTypes ? (
          <Button variant="ghost" onClick={() => navigate("/absences/types")}>
            <Settings2 />
            Tipos de ausencia
          </Button>
        ) : null}
      </nav>
    </TopBar>
  )
}
