import type { ChartConfig } from "@/components/ui/chart"

export const MAX_POINTS = 180
export const MINI_HISTORY_POINTS = 60
export const DEFAULT_LATITUDE = 37.97742
export const DEFAULT_LONGITUDE = -0.67182
export const DEFAULT_ZOOM = 13.2

export const telemetryChartConfig = {
  speed: {
    label: "Velocidad",
    color: "#2563eb",
  },
  rpm: {
    label: "RPM",
    color: "#8b5cf6",
  },
} satisfies ChartConfig
