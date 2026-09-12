import type { RouteObject } from "react-router-dom"
import { Navigate } from "react-router-dom"
import { PermissionRoute } from "@/features/auth/components/PermissionRoute"
import { AbsencesLayout } from "@/features/absences/layout/AbsencesLayout"
import { AbsenceTypesPage } from "@/features/absences/absence-type/page/AbsenceTypesPage"
import { MyAbsencesPage } from "@/features/absences/my-absences/page/MyAbsencesPage"
import { AbsencesPage } from "@/features/absences/layout/page/AbsencesPage"
import type { PermissionRule } from "@/features/auth/utils/permission.utils"

const anyOf = (...permissions: string[]): PermissionRule => ({
  mode: "any",
  permissions,
})

const absencesModuleRule = anyOf(
  // "absence.own.view",
  // "absence.management.view",
  // "absence.type.view"
)
// const myAbsencesRule = anyOf("absence.own.view")
const myAbsencesRule = anyOf()

// const absenceRequestsRule = anyOf("absence.management.view")
const absenceRequestsRule = anyOf()

// const absenceTypesRule = anyOf("absence.type.view")
const absenceTypesRule = anyOf()


export const absencesRoutes: RouteObject = {
  path: "absences",
  element: (
    <PermissionRoute rule={absencesModuleRule}>
      <AbsencesLayout />
    </PermissionRoute>
  ),
  children: [
    { index: true, element: <Navigate to="my-absences" replace /> },
    {
      path: "my-absences",
      element: (
        <PermissionRoute rule={myAbsencesRule}>
          <MyAbsencesPage />
        </PermissionRoute>
      ),
    },
    {
      path: "requests",
      element: (
        <PermissionRoute rule={absenceRequestsRule}>
          <AbsencesPage />
        </PermissionRoute>
      ),
    },
    {
      path: "types",
      element: (
        <PermissionRoute rule={absenceTypesRule}>
          <AbsenceTypesPage />
        </PermissionRoute>
      ),
    },
  ],
}
