import { useState, type FormEvent } from "react"
import {
  AlertCircle,
  ArrowRight,
  Boxes,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react"
import { useDispatch } from "react-redux"
import { useLocation, useNavigate, type Location } from "react-router-dom"

import heroImage from "@/assets/login-hero-scgia.png"
import { useNotifications } from "@/components/notifications/NotificationsProvider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import type { AppDispatch } from "@/store/store"
import { useLazyMeQuery, useLoginMutation } from "../api/authApi"
import { clearAuth } from "../store/authSlice"

type LocationState = {
  from?: Location
}

type ApiErrorData = {
  message?: unknown
}

type ApiError = {
  data?: unknown
}

function getApiErrorMessage(error: unknown) {
  const data = (error as ApiError | undefined)?.data

  if (typeof data === "string") {
    return data
  }

  if (
    data &&
    typeof data === "object" &&
    typeof (data as ApiErrorData).message === "string"
  ) {
    return (data as { message: string }).message
  }

  return "No se pudo iniciar sesion"
}

export function LoginPage() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const location = useLocation()
  const notifications = useNotifications()
  const [login, { isLoading, error }] = useLoginMutation()
  const [loadCurrentAccount, { isFetching: isLoadingAccount }] =
    useLazyMeQuery()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const from = (location.state as LocationState | null)?.from?.pathname ?? "/"
  const isSubmitting = isLoading || isLoadingAccount

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const normalizedUsername = username.trim()

    if (!normalizedUsername || !password.trim()) {
      setFormError("Usuario y contrasena son obligatorios")
      return
    }

    try {
      await login({
        username: normalizedUsername,
        password,
      }).unwrap()

      await loadCurrentAccount().unwrap()
      navigate(from, { replace: true })
    } catch (submitError) {
      dispatch(clearAuth())
      const message = getApiErrorMessage(submitError || error)
      setFormError(message)
      notifications.error(message)
    }
  }

  return (
    <main className="fixed inset-0 z-0 overflow-y-auto bg-[#edf2f7] p-3 text-slate-950 lg:overflow-hidden">
      <section className="grid min-h-full overflow-hidden rounded-lg border border-slate-200 bg-background shadow-[0_18px_55px_rgba(15,23,42,0.12)] lg:h-full lg:min-h-0 lg:grid-cols-[minmax(390px,0.72fr)_minmax(0,1.28fr)]">
        <section className="flex min-h-full flex-col bg-white px-5 py-5 sm:px-10 lg:min-h-0 lg:px-12">
          <header className="flex shrink-0 items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-[#020617] text-white shadow-sm">
                <Boxes className="size-5" />
              </span>
              <div>
                <p className="text-base font-semibold tracking-tight">SCGIA</p>
                <p className="text-xs text-muted-foreground">
                  Gestion logistica
                </p>
              </div>
            </div>
            <Badge variant="outline" className="hidden sm:inline-flex">
              Acceso seguro
            </Badge>
          </header>

          <div className="flex min-h-0 flex-1 items-center justify-center py-6 lg:py-0">
            <form
              className="grid w-full max-w-[420px] gap-5"
              onSubmit={(event) => void handleSubmit(event)}
            >
              <div className="grid gap-2">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  <ShieldCheck className="size-3.5" />
                  Plataforma privada
                </div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  Acceso al sistema
                </h1>
                <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                  Accede con tu usuario para continuar en el panel de gestion.
                </p>
              </div>

              {formError ? (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              ) : null}

              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="username">Usuario</Label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="username"
                      autoComplete="username"
                      value={username}
                      disabled={isSubmitting}
                      placeholder="admin"
                      className="h-11 rounded-lg bg-white pl-10 text-sm"
                      onChange={(event) => setUsername(event.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="password">Contrasena</Label>
                    <span className="text-xs text-muted-foreground">
                      SCGIA
                    </span>
                  </div>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      disabled={isSubmitting}
                      placeholder="Introduce tu contrasena"
                      className="h-11 rounded-lg bg-white pr-10 pl-10 text-sm"
                      onChange={(event) => setPassword(event.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={
                        showPassword
                          ? "Ocultar contrasena"
                          : "Mostrar contrasena"
                      }
                      className="absolute top-1/2 right-2 -translate-y-1/2"
                      onClick={() => setShowPassword((current) => !current)}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="h-11 rounded-lg bg-[#020617] text-sm text-white shadow-sm hover:bg-slate-800"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Validando..." : "Entrar"}
                <ArrowRight />
              </Button>

              <div className="grid gap-3">
                <div className="flex items-center gap-3">
                  <Separator className="flex-1" />
                  <span className="whitespace-nowrap text-xs text-muted-foreground">
                    Control de acceso
                  </span>
                  <Separator className="flex-1" />
                </div>
                <p className="text-center text-xs leading-5 text-muted-foreground">
                  Las credenciales se validan contra el servicio de
                  autenticacion y los permisos se cargan desde tu cuenta actual.
                </p>
              </div>
            </form>
          </div>
        </section>

        <aside className="relative hidden min-h-0 overflow-hidden bg-[#030712] lg:block">
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#030712]/10" />
        </aside>
      </section>
    </main>
  )
}
