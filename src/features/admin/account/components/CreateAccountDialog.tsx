import { useEffect, useState, type FormEvent } from "react"
import { Plus } from "lucide-react"

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
import type { TypeAccount } from "@/features/interface/account/enum/type-account"

import type { AccountCreateFormValues } from "../types"
import { ACCOUNT_TYPE_LABELS } from "../utils"

const EMPTY_FORM: AccountCreateFormValues = {
  username: "",
  password: "",
  typeAccount: "WEB",
}

type CreateAccountDialogProps = {
  open: boolean
  loading: boolean
  onClose: () => void
  onSubmit: (values: AccountCreateFormValues) => Promise<void>
}

export function CreateAccountDialog({
  open,
  loading,
  onClose,
  onSubmit,
}: CreateAccountDialogProps) {
  const [values, setValues] = useState<AccountCreateFormValues>(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) {
      setValues(EMPTY_FORM)
      setErrors({})
    }
  }, [open])

  function validate() {
    const nextErrors: Record<string, string> = {}

    if (!values.username.trim()) {
      nextErrors.username = "El usuario es obligatorio."
    }

    if (values.password.length < 6) {
      nextErrors.password = "La contrasena debe tener al menos 6 caracteres."
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!validate()) {
      return
    }

    await onSubmit({
      ...values,
      username: values.username.trim(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nueva cuenta</DialogTitle>
            <DialogDescription>
              Crea una cuenta de acceso para web, movil o ambos canales.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="account-username">Usuario</Label>
              <Input
                id="account-username"
                value={values.username}
                aria-invalid={Boolean(errors.username)}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    username: event.target.value,
                  }))
                }
              />
              {errors.username ? (
                <p className="text-xs text-destructive">{errors.username}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="account-password">Contrasena</Label>
              <Input
                id="account-password"
                type="password"
                value={values.password}
                aria-invalid={Boolean(errors.password)}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
              />
              {errors.password ? (
                <p className="text-xs text-destructive">{errors.password}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="account-type">Tipo de cuenta</Label>
              <select
                id="account-type"
                value={values.typeAccount}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    typeAccount: event.target.value as TypeAccount,
                  }))
                }
              >
                {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Plus />
              {loading ? "Creando..." : "Crear cuenta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
