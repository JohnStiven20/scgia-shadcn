import { useState } from "react"
import { Funnel, RotateCcw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import type { TypeAccount } from "@/features/interface/account/enum/type-account"

import type {
  AccountFilters as AccountFiltersValues,
  AccountStatusFilter,
} from "../types"
import {
  ACCOUNT_STATUS_LABELS,
  ACCOUNT_TYPE_LABELS,
  EMPTY_ACCOUNT_FILTERS,
} from "../utils"

type AccountFiltersProps = {
  values: AccountFiltersValues
  onApply: (values: AccountFiltersValues) => void
  onReset: () => void
}

function getAccountTypeFilterLabel(value: AccountFiltersValues["typeAccount"]) {
  return value === "ALL" ? "Todos" : ACCOUNT_TYPE_LABELS[value]
}

function getAccountStatusFilterLabel(value: AccountStatusFilter) {
  return ACCOUNT_STATUS_LABELS[value]
}

export function AccountFilters({
  values,
  onApply,
  onReset,
}: AccountFiltersProps) {
  const [draft, setDraft] = useState<AccountFiltersValues>(values)

  return (
    <section className="flex flex-col gap-6" aria-label="Filtros de cuentas">
      <form
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault()
          onApply(draft)
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="account-name">Usuario</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="account-name"
              name="name"
              placeholder="Buscar usuario"
              value={draft.name}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              className="h-8 pl-8"
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="account-type">Tipo de cuenta</Label>
          <Select
            value={draft.typeAccount}
            onValueChange={(value) =>
              setDraft((current) => ({
                ...current,
                typeAccount: value as TypeAccount | "ALL",
              }))
            }
          >
            <SelectTrigger id="account-type" className="h-8 w-full">
              <span>{getAccountTypeFilterLabel(draft.typeAccount)}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="account-status">Estado</Label>
          <Select
            value={draft.status}
            onValueChange={(value) =>
              setDraft((current) => ({
                ...current,
                status: value as AccountStatusFilter,
              }))
            }
          >
            <SelectTrigger id="account-status" className="h-8 w-full">
              <span>{getAccountStatusFilterLabel(draft.status)}</span>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ACCOUNT_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-end justify-end gap-3 sm:col-span-2 lg:col-span-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setDraft(EMPTY_ACCOUNT_FILTERS)
              onReset()
            }}
          >
            <RotateCcw />
            Limpiar
          </Button>
          <Button type="submit">
            <Funnel />
            Aplicar filtros
          </Button>
        </div>
      </form>
    </section>
  )
}
