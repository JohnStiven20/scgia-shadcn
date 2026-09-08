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
import type { MovementTransaction } from "@/features/interface/traceability/types"
import { useMediaQuery } from "@/hooks/use-media-query"
import { TraceabilityEventDetails } from "./TraceabilityEventDetails"

type TraceabilityEventDetailPanelProps = {
  event: MovementTransaction | null
  open: boolean
  onClose: () => void
}

export function TraceabilityEventDetailPanel({
  event,
  open,
  onClose,
}: TraceabilityEventDetailPanelProps) {
  const desktop = useMediaQuery("(min-width: 1024px)")

  if (desktop) {
    if (!open || !event) return null

    return (
      <aside
        className="sticky top-3 h-[38rem] max-h-[calc(100svh-6rem)] min-h-0"
        aria-label="Detalle del evento"
      >
        <Card
          size="sm"
          className="relative h-full [--card-spacing:--spacing(2.5)]"
        >
          <CardHeader className="shrink-0 border-b pr-10">
            <CardTitle className="text-sm">Detalle del evento</CardTitle>
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
            <TraceabilityEventDetails event={event} />
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
          <SheetTitle>Detalle del evento</SheetTitle>
          <SheetDescription className="sr-only">
            Información y movimientos asociados al evento seleccionado.
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
          {event ? <TraceabilityEventDetails event={event} /> : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}
