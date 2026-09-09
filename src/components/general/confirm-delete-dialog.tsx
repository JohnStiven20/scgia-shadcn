import { useState } from "react"
import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type ConfirmDeleteDialogProps = {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  onDelete: () => Promise<void> | void
  loading?: boolean
}

export function ConfirmDeleteDialog({
  open,
  title,
  subtitle,
  onClose,
  onDelete,
  loading: loadingProp,
}: ConfirmDeleteDialogProps) {
  const [loadingLocal, setLoadingLocal] = useState(false)
  const loading = loadingProp ?? loadingLocal

  async function handleDelete() {
    try {
      setLoadingLocal(true)
      await onDelete()
      onClose()
    } finally {
      setLoadingLocal(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !loading) {
          onClose()
        }
      }}
    >
      <DialogContent showCloseButton={!loading} className="max-w-md gap-0 p-0">
        <DialogHeader className="border-b bg-destructive/5 px-6 py-5 pr-14">
          <div className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold">
                {title}
              </DialogTitle>
              {subtitle ? (
                <DialogDescription className="mt-0.5">
                  {subtitle}
                </DialogDescription>
              ) : null}
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5">
          <div className="rounded-lg border border-dashed border-destructive/40 bg-destructive/5 p-4 text-xs leading-5 text-muted-foreground">
            Esta accion es <strong>irreversible</strong>. Si continuas, el
            registro se eliminara permanentemente.
          </div>
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={loading}
            onClick={handleDelete}
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export type { ConfirmDeleteDialogProps }
