import { useEffect, type ReactNode } from "react"
import { LoaderCircle } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"

import type { AppDispatch, RootState } from "@/store/store"
import { useMeQuery } from "../api/authApi"
import { clearAuth, setAuthInitialized } from "../store/authSlice"

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, isInitialized } = useSelector(
    (state: RootState) => state.auth
  )
  const { isLoading, isFetching, isSuccess, isError } = useMeQuery(undefined, {
    skip: !isAuthenticated,
  })

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
    if (isError) {
      dispatch(clearAuth())
    }
  }, [dispatch, isError])

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
