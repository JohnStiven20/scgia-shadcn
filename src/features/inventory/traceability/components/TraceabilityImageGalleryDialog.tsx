import { useEffect, useState } from "react"

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { TraceabilityImage } from "@/features/interface/traceability/types"
import { AsyncImage } from "./AsyncImage"

type TraceabilityImageGalleryDialogProps = {
  images: TraceabilityImage[]
  imageUrls: string[]
  title: string
  selectedIndex: number | null
  onSelectedIndexChange: (index: number | null) => void
}

export function TraceabilityImageGalleryDialog({
  images,
  imageUrls,
  title,
  selectedIndex,
  onSelectedIndexChange,
}: TraceabilityImageGalleryDialogProps) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const activeIndex = Math.min(selectedIndex ?? 0, images.length - 1)
  const activeImage = images[activeIndex]

  useEffect(() => {
    if (!carouselApi || selectedIndex === null) return
    carouselApi.scrollTo(activeIndex)
  }, [activeIndex, carouselApi, selectedIndex])

  useEffect(() => {
    if (!carouselApi) return

    const selectCurrentImage = () => {
      onSelectedIndexChange(carouselApi.selectedScrollSnap())
    }

    carouselApi.on("select", selectCurrentImage)
    return () => {
      carouselApi.off("select", selectCurrentImage)
    }
  }, [carouselApi, onSelectedIndexChange])

  if (!activeImage) return null

  return (
    <Dialog
      open={selectedIndex !== null}
      onOpenChange={(open) => {
        if (!open) onSelectedIndexChange(null)
      }}
    >
      <DialogContent className="flex h-[min(88svh,48rem)] max-w-[64rem]! flex-col gap-0 p-0">
        <DialogHeader className="shrink-0 border-b px-4 py-3 pr-12">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Imagen {activeIndex + 1} de {images.length}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 bg-muted/30 p-3">
          <Carousel
            setApi={setCarouselApi}
            opts={{ startIndex: activeIndex }}
            className="h-full [&_[data-slot=carousel-item]]:h-full [&>[data-slot=carousel-content]]:h-full"
          >
            <CarouselContent className="-ml-0 h-full">
              {images.map((image, index) => (
                <CarouselItem key={image.id} className="pl-0">
                  <AsyncImage
                    src={imageUrls[index]}
                    alt={image.fileName || `Imagen ${index + 1}`}
                    className="object-contain!"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>

            {images.length > 1 ? (
              <>
                <CarouselPrevious
                  variant="secondary"
                  size="icon-lg"
                  className="left-3! shadow-md"
                  aria-label="Imagen anterior"
                />
                <CarouselNext
                  variant="secondary"
                  size="icon-lg"
                  className="right-3! shadow-md"
                  aria-label="Imagen siguiente"
                />
              </>
            ) : null}
          </Carousel>
        </div>

        {images.length > 1 ? (
          <div className="shrink-0 border-t p-2">
            <ul
              className="flex max-w-full justify-center gap-1.5 overflow-x-auto"
              aria-label="Miniaturas de la galería"
            >
              {images.map((image, index) => (
                <li key={image.id} className="shrink-0">
                  <button
                    type="button"
                    className="h-10 w-14 overflow-hidden rounded border bg-muted transition-opacity outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring/40 data-[active=true]:ring-2 data-[active=true]:ring-primary"
                    data-active={index === activeIndex}
                    onClick={() => onSelectedIndexChange(index)}
                    aria-label={`Ver imagen ${index + 1}`}
                    aria-current={index === activeIndex ? "true" : undefined}
                  >
                    <AsyncImage
                      src={imageUrls[index]}
                      alt=""
                      aria-hidden="true"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
