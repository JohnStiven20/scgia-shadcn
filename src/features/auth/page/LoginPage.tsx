import { useState, type FormEvent } from "react"
import {
  AlertCircle,
  ArrowRight,
  Boxes,
  Eye,
  EyeOff,
  LockKeyhole,
  UserRound,
} from "lucide-react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"

import heroImage from "@/assets/login-hero-scgia.png"
import { useNotifications } from "@/components/notifications/NotificationsProvider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import type { AppDispatch } from "@/store/store"
import { authApi, useLazyMeQuery, useLoginMutation } from "../api/authApi"
import { clearAuth, setAuthSession } from "../store/authSlice"
import { getFirstAccessibleRoute } from "../utils/authorized-navigation"

type ApiErrorData = {
  message?: unknown
}

type ApiError = {
  data?: unknown
}

function getApiErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

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
  const notifications = useNotifications()
  const [login, { isLoading, error }] = useLoginMutation()
  const [loadCurrentAccount, { isFetching: isLoadingAccount }] =
    useLazyMeQuery()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

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
      const loginResponse = await login({
        username: normalizedUsername,
        password,
      }).unwrap()
      const nextToken = loginResponse.token ?? loginResponse.accessToken ?? null

      if (!nextToken) {
        throw new Error("No se recibio un token de autenticacion")
      }

      dispatch(authApi.util.resetApiState())
      localStorage.setItem("token", nextToken)
      sessionStorage.removeItem("token")

      const currentAccount = await loadCurrentAccount().unwrap()
      dispatch(setAuthSession({ token: nextToken, currentAccount }))

      const firstAccessibleRoute = getFirstAccessibleRoute(
        currentAccount.permissions
      )

      navigate(firstAccessibleRoute ?? "/sin-permisos", { replace: true })
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
          </header>

          <div className="flex min-h-0 flex-1 items-center justify-center py-6 lg:py-0">
            <form
              className="grid w-full max-w-105 gap-5"
              onSubmit={(event) => void handleSubmit(event)}
            >
              <div className="grid gap-2">
                <h1 className="text-3xl font-semibold text-center tracking-tight">
                  Acceso al sistema
                </h1>
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
                  <InputGroup className="h-10 rounded-lg bg-white">
                    <InputGroupAddon>
                      <UserRound className="size-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="username"
                      autoComplete="username"
                      value={username}
                      disabled={isSubmitting}
                      placeholder="admin"
                      className="text-sm mx-1"
                      onChange={(event) => setUsername(event.target.value)}
                    />
                  </InputGroup>
                </div>

                <div className="grid gap-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="password">Contrasena</Label>
                    <span className="text-xs text-muted-foreground">SCGIA</span>
                  </div>
                  <InputGroup className="h-10 rounded-lg bg-white">
                    <InputGroupAddon>
                      <LockKeyhole className="size-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      disabled={isSubmitting}
                      placeholder="Introduce tu contrasena"
                      className="text-sm mx-1"
                      onChange={(event) => setPassword(event.target.value)}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        size="icon-sm"
                        aria-label={
                          showPassword
                            ? "Ocultar contrasena"
                            : "Mostrar contrasena"
                        }
                        onClick={() => setShowPassword((current) => !current)}
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
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
                  <span className="text-xs whitespace-nowrap text-muted-foreground">
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
