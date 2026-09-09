import { useMemo, useState } from "react"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { API_BASE_URL } from "@/api/apiConfig"
import type { TraceabilityImage } from "@/features/interface/traceability/types"
import { AsyncImage } from "./AsyncImage"
import { TraceabilityImageGalleryDialog } from "./TraceabilityImageGalleryDialog"

function resolveImageUrl(fileUrl: string) {
  if (/^(https?:|data:|blob:)/i.test(fileUrl)) return fileUrl

  try {
    const apiUrl = new URL(API_BASE_URL)

    return fileUrl.startsWith("/")
      ? `${apiUrl.origin}${fileUrl}`
      : new URL(fileUrl, `${API_BASE_URL.replace(/\/$/, "")}/`).toString()
  } catch {
    return fileUrl
  }
}

type TraceabilityImageGridProps = {
  images: TraceabilityImage[]
  emptyMessage?: string
  galleryTitle?: string
}

export function TraceabilityImageGrid({
  images,
  emptyMessage = "Sin imágenes",
  galleryTitle = "Imágenes asociadas",
}: TraceabilityImageGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const imageUrls = useMemo(
    () => images.map((image) => resolveImageUrl(image.fileUrl)),
    [images]
  )

  if (!images.length) {
    return <p className="text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <>
      <ul
        className="flex max-w-full gap-1.5 overflow-x-auto pb-0.5"
        aria-label="Imágenes asociadas"
      >
        {images.map((image, index) => (
          <li key={image.id} className="w-14 shrink-0">
            <button
              type="button"
              className="block w-full overflow-hidden rounded border bg-muted transition-opacity outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring/40"
              onClick={() => setSelectedIndex(index)}
              aria-label={`Ampliar ${image.fileName || `imagen ${index + 1}`}`}
            >
              <AspectRatio ratio={4 / 3}>
                <AsyncImage
                  src={imageUrls[index]}
                  alt={image.fileName || `Imagen ${image.id}`}
                />
              </AspectRatio>
            </button>
          </li>
        ))}
      </ul>

      <TraceabilityImageGalleryDialog
        images={images}
        imageUrls={imageUrls}
        title={galleryTitle}
        selectedIndex={selectedIndex}
        onSelectedIndexChange={setSelectedIndex}
      />
    </>
  )
}
