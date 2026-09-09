import { useState } from "react"
import { Info, Package, ScanBarcode, Trash2, Truck } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGetProvidersQuery } from "@/features/inventory/models/api/modelsApi"
import { InventoryPageHeader } from "../../components"

function PreparationArea() {
  const [providerId, setProviderId] = useState("")
  const { data: providers = [], isLoading: isLoadingProviders } =
    useGetProvidersQuery()
  const hasProvider = providerId.length > 0

  return (
    <article className="rounded-xl border bg-card p-4 sm:p-6">
      <header className="mb-5">
        <h2 className="text-lg font-semibold">Área de preparación</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Selecciona un proveedor y escanea o agrega los productos para esta
          entrada.
        </p>
      </header>

      <section aria-labelledby="reading-provider-title" >

        <article>
          <h3 id="reading-provider-title" className="mb-2 text-sm font-medium">
            Proveedor de lectura
          </h3>
          <Select value={providerId} onValueChange={setProviderId}>
            <SelectTrigger
              className="h-9 w-full"
              disabled={isLoadingProviders}
            >
              <Truck className="size-4 text-muted-foreground" />
              <SelectValue placeholder="Selecciona un proveedor" />
            </SelectTrigger>
            <SelectContent>
              {providers.map((provider) => (
                <SelectItem key={provider.id} value={String(provider.id)}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </article>

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          disabled={!hasProvider}
        >
          <ScanBarcode />
          {hasProvider ? "Escáner listo" : "Escáner desactivado"}
        </Button>

        <Button
          type="button"
          variant="destructive"
          className="w-full sm:w-auto"
          disabled
        >
          <Trash2 />
          Limpiar área
        </Button>
      </section>

      {!hasProvider ? (
        <Alert className="mt-4 border-primary/30 bg-primary/5 text-primary">
          <Info />
          <AlertTitle>
            Debes seleccionar un proveedor para habilitar el escaneo.
          </AlertTitle>
          <AlertDescription>
            El proveedor es obligatorio para interpretar correctamente los
            códigos escaneados.
          </AlertDescription>
        </Alert>
      ) : null}

      <Empty className="mt-5 min-h-64 rounded-lg border border-dashed border-primary/20 bg-background px-4 py-8">
        <EmptyHeader className="max-w-lg gap-2">
          <EmptyMedia
            variant="default"
            className="mb-2 flex size-16 items-center justify-center rounded-full bg-primary/5 text-primary/70"
          >
            <Package className="size-8 stroke-[1.4]" />
          </EmptyMedia>
          <EmptyTitle className="text-base font-semibold">
            Listo para añadir productos
          </EmptyTitle>
          <EmptyDescription className="text-center text-sm">
            {hasProvider
              ? "Escanea un producto o agrega un consumible para comenzar la preparación."
              : "Selecciona un proveedor para activar el escáner y comenzar la preparación."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>

      <Button type="button" className="mt-4 w-full" disabled>
        <Package />
        Registrar entrada
      </Button>
    </article>
  )
}

export const EntryPage = () => {
  return (
    <section className="flex flex-col gap-6" aria-label="Entrada de inventario">
      <InventoryPageHeader
        title="Entrada"
        description="Registra los productos que ingresan al inventario."
      />

      <section aria-label="Área de preparación">
        <PreparationArea />
      </section>
    </section>
  )
}
