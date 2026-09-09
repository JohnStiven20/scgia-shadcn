// src/utils/currencyUtils.ts

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
})

export function formatCurrency(
  value?: number | null,
  fallback: string = "Sin importe"
): string {
  if (value === null || value === undefined) {
    return fallback
  }

  return currencyFormatter.format(value)
}