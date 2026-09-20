import type { RouteObject } from "react-router-dom"
import { PermissionRoute } from "@/features/auth/components/PermissionRoute"
import { AbsencesIndexRedirect } from "@/features/absences/layout/AbsencesIndexRedirect"
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
  "absence.own.view",
  "absence.management.view",
  "absence.type.view"
)
const myAbsencesRule = anyOf("absence.own.view")

const absenceRequestsRule = anyOf("absence.management.view")

const absenceTypesRule = anyOf("absence.type.view")

export const absencesRoutes: RouteObject = {
  path: "absences",
  element: (
    <PermissionRoute rule={absencesModuleRule}>
      <AbsencesLayout />
    </PermissionRoute>
  ),
  children: [
    { index: true, element: <AbsencesIndexRedirect /> },
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
