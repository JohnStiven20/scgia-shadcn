import type { RouteObject } from "react-router-dom"
import { Navigate } from "react-router-dom"
import { AbsencesLayout } from "@/features/absences/layout/AbsencesLayout"
import { AbsenceTypesPage } from "@/features/absences/absence-type/page/AbsenceTypesPage"
import { MyAbsencesPage } from "@/features/absences/my-absences/page/MyAbsencesPage"
import { AbsencesPage } from "@/features/absences/layout/page/AbsencesPage"


export const absencesRoutes: RouteObject = {
  path: "absences",
  element: <AbsencesLayout />,
  children: [
    { index: true, element: <Navigate to="my-absences" replace /> },
    { path: "my-absences", element: <MyAbsencesPage /> },
    {
      path: "requests",
      element: <AbsencesPage />,
    },
    {
      path: "types",
      element: <AbsenceTypesPage />,
    },
  ],
}
