import { useState } from "react"
import { ImageOff } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type AsyncImageProps = Omit<
  React.ComponentProps<"img">,
  "src" | "alt" | "onLoad" | "onError"
> & {
  src: string
  alt: string
}

export function AsyncImage({ className, src, alt, ...props }: AsyncImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <span className="flex size-full items-center justify-center bg-muted text-muted-foreground">
        <ImageOff className="size-5" />
        <span className="sr-only">No se pudo cargar {alt}</span>
      </span>
    )
  }

  return (
    <span className="relative block size-full overflow-hidden bg-muted">
      {!loaded ? <Skeleton className="absolute inset-0 size-full" /> : null}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn(
          "size-full object-cover transition-opacity",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        {...props}
      />
    </span>
  )
}
