
import { useEffect, useRef, useState } from "react"
import { MapPin, Navigation } from "lucide-react"

import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  type MapRef,
} from "@/components/ui/map"
import { cn } from "@/lib/utils"

import { DEFAULT_ZOOM } from "./constants"

export function VehicleMapSurface({
  latitude,
  longitude,
  heading,
  followRequest,
  zoomRequest,
  heightClassName,
}: {
  latitude: number
  longitude: number
  heading: number
  followRequest: number
  zoomRequest: number
  heightClassName: string
}) {
  const mapRef = useRef<MapRef | null>(null)
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [mapMode, setMapMode] = useState<"map" | "satellite">("map")

  const markerScale = Math.min(
    1,
    Math.max(0.45, 0.45 + ((zoom - 5) / 10) * 0.55)
  )

  useEffect(() => {
    mapRef.current?.easeTo({
      center: [longitude, latitude],
      duration: 900,
      zoom: Math.max(mapRef.current.getZoom(), DEFAULT_ZOOM),
    })
  }, [latitude, longitude])

  useEffect(() => {
    if (!followRequest || !mapRef.current) return

    mapRef.current.easeTo({
      center: [longitude, latitude],
      duration: 700,
      zoom: Math.max(mapRef.current.getZoom(), DEFAULT_ZOOM),
    })
  }, [followRequest, latitude, longitude])

  useEffect(() => {
    if (!zoomRequest || !mapRef.current) return

    mapRef.current.easeTo({
      center: [longitude, latitude],
      duration: 700,
      zoom: 17,
    })
  }, [zoomRequest, latitude, longitude])

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-muted shadow-inner",
        heightClassName
      )}
    >
      <div className="relative size-full">
        <Map
          ref={mapRef}
          center={[longitude, latitude]}
          zoom={DEFAULT_ZOOM}
          dragRotate={false}
          styles={mapMode === "satellite" ? { light: satelliteStyle, dark: satelliteStyle } : undefined}
          onViewportChange={({ zoom: nextZoom }) => setZoom(nextZoom)}
        >
          <MapMarker longitude={longitude} latitude={latitude} rotation={heading}>
            <MarkerContent>
              <div className="relative">
                <div
                  className="size-4 rounded-full bg-blue-600 shadow-lg ring-2 shadow-blue-500/30 ring-white transition-transform duration-100"
                  style={{ transform: `scale(${markerScale})` }}
                />
              </div>
            </MarkerContent>
          </MapMarker>
          <MapControls position="top-right" showCompass showFullscreen />
        </Map>
        <div className="absolute top-3 left-3 z-10 flex rounded-md border bg-white/95 p-1 shadow-md backdrop-blur">
          <button
            type="button"
            className={cn(
              "rounded px-3 py-1.5 text-xs font-semibold transition-colors",
              mapMode === "map"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            )}
            onClick={() => setMapMode("map")}
          >
            Mapa
          </button>
          <button
            type="button"
            className={cn(
              "rounded px-3 py-1.5 text-xs font-semibold transition-colors",
              mapMode === "satellite"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            )}
            onClick={() => setMapMode("satellite")}
          >
            Satélite
          </button>
        </div>
      </div>
    </div>
  )
}

const satelliteStyle = {
  version: 8 as const,
  sources: {
    esriWorldImagery: {
      type: "raster" as const,
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "© Esri",
    },
  },
  layers: [
    {
      id: "esri-world-imagery",
      type: "raster" as const,
      source: "esriWorldImagery",
    },
  ],
}

export function LocationStrip({
  title,
  coordinates,
  direction,
  heading,
}: {
  title: string
  coordinates: string
  direction: string
  heading: number
}) {
  return (
    <div className="rounded-lg border bg-card/95 px-3 py-3 shadow-lg backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-2">
          <MapPin className="mt-0.5 size-4 shrink-0 text-slate-900" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-700">
              {title}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {coordinates}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 text-blue-600">
          <Navigation
            className="size-4"
            style={{ transform: `rotate(${heading}deg)` }}
          />
          <span className="text-sm font-semibold">{direction}</span>
        </div>
      </div>
    </div>
  )
}
