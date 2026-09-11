import type { SelectOption } from "@/components/general/options-select"
import type { VehicleDocumentType } from "@/features/interface/vehicle/enum/vehicle-document-type"

import type {
  VehicleDocumentFilters,
  VehicleDocumentQuickFilter,
  VehicleDocumentStatus,
} from "./types"

export const EXPIRING_SOON_DAYS = 45

export const VEHICLE_DOCUMENT_TYPE_META: Record<
  VehicleDocumentType,
  {
    label: string
    categoryLabel: string
    iconColor: string
    iconBackground: string
    requiresExpirationDate: boolean
  }
> = {
  REGISTRATION_PERMIT: {
    label: "Permiso de circulacion",
    categoryLabel: "Legal",
    iconColor: "text-blue-700",
    iconBackground: "bg-blue-50",
    requiresExpirationDate: false,
  },
  INSURANCE: {
    label: "Seguro",
    categoryLabel: "Cobertura",
    iconColor: "text-emerald-700",
    iconBackground: "bg-emerald-50",
    requiresExpirationDate: true,
  },
  ITV: {
    label: "ITV",
    categoryLabel: "Revision",
    iconColor: "text-amber-700",
    iconBackground: "bg-amber-50",
    requiresExpirationDate: true,
  },
  TECHNICAL_SHEET: {
    label: "Ficha tecnica",
    categoryLabel: "Tecnico",
    iconColor: "text-violet-700",
    iconBackground: "bg-violet-50",
    requiresExpirationDate: false,
  },
  RENTING_CONTRACT: {
    label: "Contrato de renting",
    categoryLabel: "Contrato",
    iconColor: "text-slate-700",
    iconBackground: "bg-slate-100",
    requiresExpirationDate: true,
  },
  OTHER: {
    label: "Otro",
    categoryLabel: "General",
    iconColor: "text-slate-600",
    iconBackground: "bg-slate-100",
    requiresExpirationDate: false,
  },
}

export const VEHICLE_DOCUMENT_STATUS_META: Record<
  VehicleDocumentStatus,
  { label: string; className: string }
> = {
  VALID: {
    label: "Vigente",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  EXPIRING_SOON: {
    label: "Por vencer",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  EXPIRED: {
    label: "Caducado",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  NO_EXPIRATION: {
    label: "Sin caducidad",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
}

export const VEHICLE_DOCUMENT_FILTER_OPTIONS: Array<{
  value: VehicleDocumentQuickFilter
  label: string
}> = [
  { value: "ALL", label: "Todo" },
  { value: "VALID", label: "Vigentes" },
  { value: "EXPIRING_SOON", label: "Por vencer" },
  { value: "EXPIRED", label: "Caducados" },
]

export const VEHICLE_DOCUMENT_TYPE_OPTIONS: SelectOption<
  VehicleDocumentType | "ALL"
>[] = [
  { value: "ALL", label: "Todos los tipos" },
  ...Object.entries(VEHICLE_DOCUMENT_TYPE_META).map(([value, meta]) => ({
    value: value as VehicleDocumentType,
    label: meta.label,
  })),
]

export const VEHICLE_DOCUMENT_STATUS_OPTIONS: SelectOption<VehicleDocumentQuickFilter>[] =
  VEHICLE_DOCUMENT_FILTER_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  }))

export const DEFAULT_VEHICLE_DOCUMENT_FILTERS: VehicleDocumentFilters = {
  documentType: "ALL",
  status: "ALL",
  title: "",
}
