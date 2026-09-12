import { Filter, Laptop, Search, ToggleLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { TypeAccount } from "@/features/interface/account/enum/type-account"

import type { AccountFilters, AccountStatusFilter } from "../types"
import {
  ACCOUNT_STATUS_LABELS,
  ACCOUNT_TYPE_LABELS,
  EMPTY_ACCOUNT_FILTERS,
} from "../utils"

type AccountFiltersCardProps = {
  filters: AccountFilters
  onFiltersChange: (filters: AccountFilters) => void
  onApply: () => void
  onClear: () => void
}

export function AccountFiltersCard({
  filters,
  onFiltersChange,
  onApply,
  onClear,
}: AccountFiltersCardProps) {
  return (
    <Card className="border-border/80 py-4 shadow-sm shadow-slate-100/70">
      <CardContent className="grid gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-lg border bg-slate-50 text-slate-700">
              <Filter className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Filtros</h2>
              <p className="text-sm text-muted-foreground">
                Busca y filtra el listado de cuentas.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => {
                onFiltersChange(EMPTY_ACCOUNT_FILTERS)
                onClear()
              }}
            >
              Limpiar
            </Button>
            <Button type="button" size="lg" onClick={onApply}>
              Aplicar filtros
            </Button>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-950">Usuario</span>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" />
              <Input
                value={filters.name}
                placeholder="Buscar usuario"
                className="h-11 pl-9"
                onChange={(event) =>
                  onFiltersChange({ ...filters, name: event.target.value })
                }
              />
            </div>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-950">
              Tipo de cuenta
            </span>
            <div className="relative">
              <Laptop className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" />
              <select
                value={filters.typeAccount}
                className="h-11 w-full rounded-md border border-input bg-background px-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                onChange={(event) =>
                  onFiltersChange({
                    ...filters,
                    typeAccount: event.target.value as TypeAccount | "ALL",
                  })
                }
              >
                <option value="ALL">Todos</option>
                {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-950">Estado</span>
            <div className="relative">
              <ToggleLeft className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" />
              <select
                value={filters.status}
                className="h-11 w-full rounded-md border border-input bg-background px-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                onChange={(event) =>
                  onFiltersChange({
                    ...filters,
                    status: event.target.value as AccountStatusFilter,
                  })
                }
              >
                {Object.entries(ACCOUNT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </label>
        </div>
      </CardContent>
    </Card>
  )
}

