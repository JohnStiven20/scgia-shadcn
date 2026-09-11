import type { RouteObject } from "react-router-dom"
import { Navigate } from "react-router-dom"
import { AbsencesLayout } from "@/features/absences/layout/AbsencesLayout"
import { MyAbsencesPage } from "@/features/absences/my-absences/page/MyAbsencesPage"
import { AbsencesPlaceholderPage } from "@/features/absences/page/AbsencesPlaceholderPage"


export const absencesRoutes: RouteObject = {
  path: "absences",
  element: <AbsencesLayout />,
  children: [
    { index: true, element: <Navigate to="my-absences" replace /> },
    { path: "my-absences", element: <MyAbsencesPage /> },
    {
      path: "requests",
      element: (
        <AbsencesPlaceholderPage
          title="Peticiones"
          description="Gestiona las peticiones de ausencia."
        />
      ),
    },
    {
      path: "types",
      element: (
        <AbsencesPlaceholderPage
          title="Tipos de ausencia"
          description="Consulta los tipos de ausencia disponibles."
        />
      ),
    },
  ],
}
