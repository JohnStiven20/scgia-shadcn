import { useState, type FormEvent } from "react"
import { PackagePlus, ScanLine } from "lucide-react"

import { useNotifications } from "@/components/notifications/NotificationsProvider"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { useAddTelecommunicationItemMutation } from "@/features/inventory/workorder/api/webWorkOrderApi"

type AddWorkOrderProductDialogProps = {
  open: boolean
  workOrderId: number
  workerId?: number
  onOpenChange: (open: boolean) => void
  onProductAdded?: () => void
}

export function AddWorkOrderProductDialog({ open, workOrderId, workerId, onOpenChange, onProductAdded }: AddWorkOrderProductDialogProps) {
  const [uniqueCode, setUniqueCode] = useState("")
  const [addTelecommunicationItem, { isLoading }] = useAddTelecommunicationItemMutation()
  const notifications = useNotifications()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedCode = uniqueCode.trim()

    if (!workerId) {
      notifications.error("La orden no tiene un trabajador asignado.")
      return
    }

    if (!normalizedCode) {
      notifications.error("Introduce el código único del producto.")
      return
    }

    try {
      await addTelecommunicationItem({ workOrderId, workerId, uniqueCode: normalizedCode }).unwrap()
      notifications.success("Producto añadido correctamente a la orden.")
      setUniqueCode("")
      onOpenChange(false)
      onProductAdded?.()
    } catch {
      notifications.error("No se pudo añadir el producto a la orden.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-1 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><PackagePlus className="size-5" /></div>
          <DialogTitle className="text-lg">Añadir producto</DialogTitle>
          <DialogDescription>Introduce el código único del producto que quieres asociar a esta orden de trabajo.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <Field>
            <FieldLabel htmlFor="work-order-product-code">Código único</FieldLabel>
            <InputGroup>
              <InputGroupAddon><ScanLine /></InputGroupAddon>
              <InputGroupInput id="work-order-product-code" value={uniqueCode} autoFocus placeholder="Ej. 88FEB623DDC0" onChange={(event) => setUniqueCode(event.target.value)} />
            </InputGroup>
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isLoading} onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Añadiendo..." : "Añadir producto"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
