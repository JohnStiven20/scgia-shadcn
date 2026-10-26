import { getBackendErrorMessage, useGlobalError } from "@/hooks/useGlobalError"

export const WORK_ORDER_ERROR_MESSAGES = {
  default: "No se pudo completar la operacion sobre la orden de trabajo.",
  createIncident: "No se pudo registrar la incidencia.",
  resolveIncident: "No se pudo resolver la incidencia.",
  finishIncident: "No se pudo finalizar la incidencia.",
  refreshStatus: "No se pudo actualizar el estado de la orden de trabajo.",
} as const

export function getWorkOrderErrorMessage(
  error: unknown,
  fallbackMessage = WORK_ORDER_ERROR_MESSAGES.default
): string {
  return getBackendErrorMessage(error, fallbackMessage)
}

export function useWorkOrderError() {
  const { handleError } = useGlobalError()

  return {
    getWorkOrderErrorMessage,
    handleWorkOrderError: (
      error: unknown,
      fallbackMessage = WORK_ORDER_ERROR_MESSAGES.default
    ) => handleError(error, fallbackMessage),
  }
}
