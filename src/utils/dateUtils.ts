// src/utils/dateUtils.ts

/**
 * Formatea una fecha usando el formato español.
 *
 * Ejemplo:
 * "2026-09-09T10:30:00Z" -> "09/09/2026"
 */
export function formatDate(
  value?: string | Date | null,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  },
  fallback: string = "Sin fecha"
): string {
  if (!value) {
    return fallback;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat("es-ES", options).format(date);
}


/**
 * Convierte una fecha a formato YYYY-MM-DD.
 *
 * Útil para inputs type="date".
 *
 * Ejemplo:
 * "2026-09-09T10:30:00Z" -> "2026-09-09"
 */
export function toDateOnly(
  value?: string | Date | null
): string | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return null;
    }

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const datePart = value.slice(0, 10);

  const date = new Date(datePart);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return datePart;
}


/**
 * Devuelve la fecha actual en formato YYYY-MM-DD.
 *
 * Ejemplo:
 * "2026-09-09"
 */
export function getTodayDate(): string {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


/**
 * Formatea una fecha incluyendo hora y minutos.
 *
 * Ejemplo:
 * "2026-09-09T10:30:00" -> "09/09/2026, 10:30"
 */
export function formatDateTime(
  value?: string | Date | null,
  fallback: string = "Sin fecha"
): string {
  if (!value) {
    return fallback;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}