import { useRef } from "react"
import { ImagePlus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { ReturnLocalEvidence } from "../types"

type ReturnEvidenceUploaderProps = {
  evidence: ReturnLocalEvidence[]
  onAdd: (files: File[]) => void
  onRemove: (localId: string) => void
}

export function ReturnEvidenceUploader({
  evidence,
  onAdd,
  onRemove,
}: ReturnEvidenceUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <section className="space-y-3" aria-label="Evidencias fotográficas">
      {evidence.length > 0 ? (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {evidence.map((item) => (
            <li
              key={item.localId}
              className="relative overflow-hidden rounded-lg border bg-muted"
            >
              <img
                src={item.previewUrl}
                alt={item.file.name}
                className="aspect-square size-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1.5 right-1.5"
                aria-label={`Eliminar ${item.file.name}`}
                onClick={() => onRemove(item.localId)}
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => {
          const files = Array.from(event.currentTarget.files ?? [])
          if (files.length > 0) onAdd(files)
          event.currentTarget.value = ""
        }}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full sm:w-auto"
        onClick={() => inputRef.current?.click()}
      >
        <ImagePlus />
        Añadir fotos
      </Button>
    </section>
  )
}
