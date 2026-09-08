/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

type NotificationSeverity = "info" | "warning" | "error" | "success"

type NotificationContextValue = {
  notify: (message: string, severity?: NotificationSeverity) => void
  success: (message: string) => void
  error: (message: string) => void
}

const AUTO_HIDE_DURATION = 6000

const severityTitles: Record<NotificationSeverity, string> = {
  info: "Información",
  warning: "Advertencia",
  error: "Error",
  success: "Éxito",
}

const severityClasses: Record<NotificationSeverity, string> = {
  info: "border-blue-200 bg-blue-50 text-blue-900 [&_[data-slot=alert-description]]:text-blue-800",
  warning:
    "border-amber-200 bg-amber-50 text-amber-900 [&_[data-slot=alert-description]]:text-amber-800",
  error:
    "border-red-200 bg-red-50 text-red-900 [&_[data-slot=alert-description]]:text-red-800",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-900 [&_[data-slot=alert-description]]:text-emerald-800",
}

const NotificationsContext = createContext<
  NotificationContextValue | undefined
>(undefined)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [severity, setSeverity] = useState<NotificationSeverity>("info")

  const notify = (msg: string, sev: NotificationSeverity = "info") => {
    setMessage(msg)
    setSeverity(sev)
    setOpen(true)
  }

  const success = (msg: string) => notify(msg, "success")
  const error = (msg: string) => notify(msg, "error")

  useEffect(() => {
    if (!open) return

    const timeout = window.setTimeout(() => setOpen(false), AUTO_HIDE_DURATION)

    return () => window.clearTimeout(timeout)
  }, [open, message])

  const value: NotificationContextValue = {
    notify,
    success,
    error,
  }

  const notification = open ? (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-2">
      <Alert
        variant={severity === "error" ? "destructive" : "default"}
        className={`pointer-events-auto w-[min(560px,calc(100vw-1rem))] ${severityClasses[severity]}`}
      >
        <AlertTitle>{severityTitles[severity]}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
        <AlertAction>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Cerrar notificación"
            onClick={() => setOpen(false)}
          >
            <X />
          </Button>
        </AlertAction>
      </Alert>
    </div>
  ) : null

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      {typeof document !== "undefined" && notification
        ? createPortal(notification, document.body)
        : null}
    </NotificationsContext.Provider>
  )
}

export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationsContext)

  if (!context) {
    throw new Error(
      "useNotifications debe usarse dentro de NotificationsProvider"
    )
  }

  return context
}
