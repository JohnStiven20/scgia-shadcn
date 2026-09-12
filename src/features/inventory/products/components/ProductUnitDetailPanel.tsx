import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import type { TelecommunicationSpecificItemHistoryResponse } from "@/features/interface/products/telecommunicationSpecificItemHistory"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ProductUnitDetail } from "./ProductUnitDetail"

type ProductUnitDetailPanelProps = {
  open: boolean
  response: TelecommunicationSpecificItemHistoryResponse | undefined
  isLoading: boolean
  isError: boolean
  onClose: () => void
}

function PanelBody({
  response,
  isLoading,
  isError,
}: Pick<ProductUnitDetailPanelProps, "response" | "isLoading" | "isError">) {
  if (isLoading) {
    return (
      <div className="grid gap-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-52 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <p
        role="alert"
        className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-destructive"
      >
        No se pudo cargar el detalle de la unidad.
      </p>
    )
  }

  return response ? <ProductUnitDetail response={response} /> : null
}

export function ProductUnitDetailPanel({
  open,
  response,
  isLoading,
  isError,
  onClose,
}: ProductUnitDetailPanelProps) {
  const desktop = useMediaQuery("(min-width: 1024px)")

  if (desktop) {
    if (!open) return null

    return (
      <aside
        className="sticky top-3 h-[38rem] max-h-[calc(100svh-6rem)] min-h-0"
        aria-label="Detalle de la unidad"
      >
        <Card
          size="sm"
          className="relative h-full [--card-spacing:--spacing(3)]"
        >
          <CardHeader className="shrink-0 border-b pr-10">
            <CardTitle>Detalle de la unidad</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-2 right-2"
              onClick={onClose}
              aria-label="Cerrar detalle"
            >
              <XIcon />
            </Button>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2">
            <PanelBody
              response={response}
              isLoading={isLoading}
              isError={isError}
            />
          </CardContent>
        </Card>
      </aside>
    )
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      <SheetContent
        side="right"
        className="w-full! overflow-hidden sm:max-w-[28rem]!"
      >
        <SheetHeader className="shrink-0 border-b p-3 pr-10">
          <SheetTitle>Detalle de la unidad</SheetTitle>
          <SheetDescription className="sr-only">
            Información y movimientos asociados a la unidad seleccionada.
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
          <PanelBody
            response={response}
            isLoading={isLoading}
            isError={isError}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
