import { useEffect, useRef } from "react"
import { Car, MapPin, Navigation } from "lucide-react"

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
  heightClassName,
}: {
  latitude: number
  longitude: number
  heading: number
  heightClassName: string
}) {
  const mapRef = useRef<MapRef | null>(null)

  useEffect(() => {
    mapRef.current?.easeTo({
      center: [longitude, latitude],
      duration: 900,
      zoom: Math.max(mapRef.current.getZoom(), DEFAULT_ZOOM),
    })
  }, [latitude, longitude])

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-muted shadow-inner",
        heightClassName
      )}
    >
      <Map
        ref={mapRef}
        center={[longitude, latitude]}
        zoom={DEFAULT_ZOOM}
        dragRotate={false}
      >
        <MapMarker longitude={longitude} latitude={latitude} rotation={heading}>
          <MarkerContent>
            <div className="grid size-12 place-items-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-8 ring-blue-500/20">
              <Car className="size-5" />
            </div>
          </MarkerContent>
        </MapMarker>
        <MapControls position="top-right" showCompass showFullscreen />
      </Map>
    </div>
  )
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
      <div className="flex items-center justify-between gap-3">
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
