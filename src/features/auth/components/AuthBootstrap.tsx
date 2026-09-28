import { useEffect, type ReactNode } from "react"
import { AlertCircle, LoaderCircle } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"

import { Button } from "@/components/ui/button"
import type { AppDispatch, RootState } from "@/store/store"
import { useMeQuery } from "../api/authApi"
import { clearAuth, setAuthInitialized } from "../store/authSlice"
import { isUnauthorizedApiError } from "../utils/auth-errors"

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, isInitialized } = useSelector(
    (state: RootState) => state.auth
  )
  const { error, isLoading, isFetching, isSuccess, isError, refetch } = useMeQuery(
    undefined,
    {
      skip: !isAuthenticated,
    }
  )

  useEffect(() => {
    if (!isAuthenticated && !isInitialized) {
      dispatch(setAuthInitialized())
    }
  }, [dispatch, isAuthenticated, isInitialized])

  useEffect(() => {
    if (isSuccess) {
      dispatch(setAuthInitialized())
    }
  }, [dispatch, isSuccess])

  useEffect(() => {
    if (isError && isUnauthorizedApiError(error)) {
      dispatch(clearAuth())
    }
  }, [dispatch, error, isError])

  const hasSessionValidationError =
    isAuthenticated && isError && !isUnauthorizedApiError(error)

  if (hasSessionValidationError) {
    return (
      <main className="grid min-h-dvh place-items-center bg-background px-4">
        <section className="grid w-full max-w-md gap-4 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div className="grid gap-1">
              <h1 className="text-base font-semibold">
                No se pudo validar la sesion
              </h1>
              <p className="text-sm leading-6 text-muted-foreground">
                El token guardado existe, pero el servidor no ha respondido
                correctamente a la validacion de la cuenta.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => dispatch(clearAuth())}
            >
              Volver al login
            </Button>
            <Button type="button" onClick={() => void refetch()}>
              Reintentar
            </Button>
          </div>
        </section>
      </main>
    )
  }

  if (isAuthenticated && (!isInitialized || isLoading || isFetching)) {
    return (
      <main className="grid min-h-dvh place-items-center bg-background">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          Validando sesion...
        </div>
      </main>
    )
  }

  return <>{children}</>
}
