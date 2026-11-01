import { Layers3, RefreshCw } from "lucide-react"

import type { ProviderInventory } from "@/features/interface/provider/base/provider.interface"
import { DatePicker } from "@/components/general"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ProductionFiltersProps = {
  providers: ProviderInventory[]
  providerId: string
  startDate: Date
  endDate: Date
  isLoading?: boolean
  isRefreshing?: boolean
  onProviderChange: (providerId: string) => void
  onStartDateChange: (date: Date) => void
  onEndDateChange: (date: Date) => void
  onRefresh: () => void
}

export function ProductionFilters({
  providers,
  providerId,
  startDate,
  endDate,
  isLoading = false,
  isRefreshing = false,
  onProviderChange,
  onStartDateChange,
  onEndDateChange,
  onRefresh,
}: ProductionFiltersProps) {
  const selectedProvider = providers.find(
    (provider) => String(provider.id) === providerId
  )

  return (
    <div className="flex w-full flex-wrap items-end justify-end gap-2 lg:w-auto">
      <DatePicker
        id="production-start-date"
        label="Fecha inicial"
        value={startDate}
        maxDate={endDate}
        onChange={onStartDateChange}
        className="w-full sm:w-44"
      />

      <DatePicker
        id="production-end-date"
        label="Fecha final"
        value={endDate}
        minDate={startDate}
        onChange={onEndDateChange}
        className="w-full sm:w-44"
      />

      <Select
        value={providerId || null}
        onValueChange={(value) => {
          if (value) onProviderChange(value)
        }}
        disabled={isLoading || providers.length === 0}
      >
        <SelectTrigger className="h-10 min-w-44 bg-background px-3 text-sm">
          <Layers3 className="size-4 text-muted-foreground" aria-hidden="true" />
          <SelectValue placeholder="Proveedor">
            {selectedProvider?.name ?? "Proveedor"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {providers.map((provider) => (
            <SelectItem key={provider.id} value={String(provider.id)}>
              {provider.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        type="button"
        className="h-10 gap-2 px-4"
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        <RefreshCw className={isRefreshing ? "size-4 animate-spin" : "size-4"} />
        Actualizar
      </Button>
    </div>
  )
}
