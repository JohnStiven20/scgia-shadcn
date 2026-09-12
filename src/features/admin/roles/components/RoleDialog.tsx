import { type FormEvent } from "react"
import { Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export type RoleFormValues = {
  name: string
  description: string
}

type RoleDialogProps = {
  open: boolean
  mode: "create" | "edit"
  values: RoleFormValues
  isSubmitting: boolean
  onClose: () => void
  onChange: (values: RoleFormValues) => void
  onSubmit: () => void
}

export function RoleDialog({
  open,
  mode,
  values,
  isSubmitting,
  onClose,
  onChange,
  onSubmit,
}: RoleDialogProps) {
  const isDisabled =
    values.name.trim().length === 0 ||
    values.description.trim().length === 0 ||
    isSubmitting

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isSubmitting) {
          onClose()
        }
      }}
    >
      <DialogContent showCloseButton={!isSubmitting}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Crear rol" : "Editar rol"}
            </DialogTitle>
            <DialogDescription>
              Define el nombre y la descripcion del rol administrativo.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="role-name">Nombre</Label>
              <Input
                id="role-name"
                value={values.name}
                disabled={isSubmitting}
                onChange={(event) =>
                  onChange({ ...values, name: event.target.value })
                }
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="role-description">Descripcion</Label>
              <Textarea
                id="role-description"
                value={values.description}
                disabled={isSubmitting}
                onChange={(event) =>
                  onChange({ ...values, description: event.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isDisabled}>
              <Save />
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
