import { AxiosError } from "axios";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useNotifications } from "../components/notifications/NotificationsProvider";

type BackendErrorPayload = {
  message?: string | string[];
  error?: string;
  details?: string | string[];
  errors?: string[] | Record<string, string | string[]>;
  title?: string;
  status?: number;
};

type SerializedLikeError = {
  message?: string;
};

const STATUS_MESSAGES: Record<number, string> = {
  400: "La solicitud no es valida.",
  401: "Tu sesion ha caducado o no tienes autorizacion.",
  402: "La operacion no pudo completarse por un problema de pago o suscripcion.",
  403: "No tienes permisos para realizar esta accion.",
  404: "No se encontro el recurso solicitado.",
  409: "La operacion entra en conflicto con el estado actual del recurso.",
  422: "No se pudo procesar la informacion enviada.",
  429: "Se han realizado demasiadas solicitudes. Intentalo de nuevo en un momento.",
  500: "Se produjo un error interno en el servidor.",
  502: "El servidor de aplicacion no responde correctamente.",
  503: "El servicio no esta disponible temporalmente.",
  504: "El servidor tardo demasiado en responder.",
};

function normalizeText(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  if (Array.isArray(value)) {
    const normalized = value
      .map((item) => normalizeText(item))
      .filter((item): item is string => Boolean(item));

    return normalized.length > 0 ? normalized.join(" ") : null;
  }

  return null;
}

function extractErrorsMap(errors: BackendErrorPayload["errors"]): string | null {
  if (!errors) {
    return null;
  }

  if (Array.isArray(errors)) {
    return normalizeText(errors);
  }

  const parts = Object.entries(errors)
    .map(([key, value]) => {
      const normalizedValue = normalizeText(value);
      return normalizedValue ? `${key}: ${normalizedValue}` : null;
    })
    .filter((item): item is string => Boolean(item));

  return parts.length > 0 ? parts.join(" ") : null;
}

function getBackendMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const payload = data as BackendErrorPayload;

  return (
    normalizeText(payload.message) ||
    normalizeText(payload.details) ||
    extractErrorsMap(payload.errors) ||
    normalizeText(payload.error) ||
    normalizeText(payload.title)
  );
}

function getStatusMessage(status?: number): string {
  if (!status) {
    return "No se pudo completar la operacion.";
  }

  return STATUS_MESSAGES[status] ?? `Se produjo un error en la solicitud (${status}).`;
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return Boolean(
    error &&
      typeof error === "object" &&
      "status" in error &&
      ("data" in error || "error" in error),
  );
}

function isSerializedError(error: unknown): error is SerializedLikeError {
  return Boolean(error && typeof error === "object" && "message" in error);
}

function buildErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const backendMessage = getBackendMessage(error.response?.data);
    const axiosMessage = normalizeText(error.message);

    return backendMessage || axiosMessage || getStatusMessage(status) || fallbackMessage;
  }

  if (isFetchBaseQueryError(error)) {
    const status = typeof error.status === "number" ? error.status : undefined;
    const backendMessage = getBackendMessage(error.data);
    const baseQueryMessage = "error" in error ? normalizeText(error.error) : null;

    return backendMessage || baseQueryMessage || getStatusMessage(status) || fallbackMessage;
  }

  if (isSerializedError(error)) {
    return normalizeText(error.message) || fallbackMessage;
  }

  if (error && typeof error === "object" && "message" in error) {
    return normalizeText((error as SerializedLikeError).message) || fallbackMessage;
  }

  return fallbackMessage;
}

export const useGlobalError = () => {
  const { notify } = useNotifications();

  const handleError = (
    error: unknown,
    fallbackMessage = "Error del servidor",
    options?: { silentStatuses?: number[] },
  ) => {
    if (error instanceof AxiosError) {
      const status = error.response?.status;

      if (status && options?.silentStatuses?.includes(status)) {
        return;
      }
    }

    if (isFetchBaseQueryError(error)) {
      const status = typeof error.status === "number" ? error.status : undefined;

      if (status && options?.silentStatuses?.includes(status)) {
        return;
      }
    }

    const message = buildErrorMessage(error, fallbackMessage);
    notify(message, "error");
  };

  return {
    handleError,
  };
};
