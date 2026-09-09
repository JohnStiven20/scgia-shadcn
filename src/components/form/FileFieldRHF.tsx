import type { ReactNode } from "react"
import { Upload, X } from "lucide-react"
import {
  Controller,
  type Control,
  type ControllerProps,
  type FieldPath,
  type FieldPathValue,
  type FieldValues,
  type UseFormGetValues,
  type UseFormResetField,
  type UseFormSetValue,
} from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { FieldOnChange } from "./types"

type FileFieldRHFProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  name: TName
  label: string
  control: Control<TFieldValues>
  accept?: string
  helperText?: string
  currentFileName?: string | null
  currentFileUrl?: string | null
  disabled?: boolean
  hidden?: boolean
  className?: string
  placeholder?: string
  adornment?: {
    start?: ReactNode
  }
  rules?: ControllerProps<TFieldValues, TName>["rules"]
  onChangeField?: FieldOnChange<TFieldValues, TName>
  setValue?: UseFormSetValue<TFieldValues>
  getValues?: UseFormGetValues<TFieldValues>
  resetField?: UseFormResetField<TFieldValues>
}

export function FileFieldRHF<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  label,
  control,
  accept,
  helperText,
  currentFileName,
  currentFileUrl,
  disabled,
  hidden,
  className,
  placeholder = "Selecciona un archivo",
  adornment,
  rules,
  onChangeField,
  setValue,
  getValues,
  resetField,
}: FileFieldRHFProps<TFieldValues, TName>) {
  if (hidden) {
    return null
  }

  return (
    <Controller
      name={name}
      rules={rules}
      control={control}
      render={({ field: { value, onChange, ref, ...field }, fieldState }) => {
        const file = value instanceof File ? value : null
        const inputId = String(name)

        return (
          <Field
            className={className}
            data-disabled={disabled || undefined}
            data-invalid={fieldState.invalid || undefined}
          >
            <FieldLabel htmlFor={inputId}>{label}</FieldLabel>

            <div className="grid gap-2">
              {currentFileName ? (
                <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2 text-xs">
                  <div className="min-w-0">
                    <p className="font-medium">Archivo actual</p>
                    <p className="truncate text-muted-foreground">
                      {currentFileName}
                    </p>
                  </div>
                  {currentFileUrl ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={disabled}
                      onClick={() => {
                        window.open(currentFileUrl, "_blank", "noopener")
                      }}
                    >
                      Ver
                    </Button>
                  ) : null}
                </div>
              ) : null}

              <label className="flex min-h-10 cursor-pointer items-center gap-3 rounded-md border border-dashed bg-input/20 px-3 py-2 text-sm transition-colors hover:bg-input/40 has-[:disabled]:pointer-events-none has-[:disabled]:opacity-50">
                {adornment?.start ?? (
                  <Upload className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className="min-w-0 flex-1 truncate text-muted-foreground">
                  {file?.name ?? placeholder}
                </span>
                <Input
                  {...field}
                  ref={ref}
                  id={inputId}
                  type="file"
                  accept={accept}
                  disabled={disabled}
                  className="sr-only"
                  value=""
                  onChange={(event) => {
                    const nextFile = event.target.files?.[0] ?? null
                    const nextValue =
                      nextFile as FieldPathValue<TFieldValues, TName>

                    onChange(nextValue)

                    if (
                      onChangeField &&
                      setValue &&
                      getValues &&
                      resetField
                    ) {
                      onChangeField(nextValue, {
                        setValue,
                        getValues,
                        resetField,
                      })
                    }
                  }}
                />
              </label>

              {file ? (
                <div className="flex items-center justify-between gap-2 rounded-md bg-muted px-2 py-1 text-xs">
                  <span className="min-w-0 truncate">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    disabled={disabled}
                    aria-label="Quitar archivo"
                    onClick={() => {
                      onChange(null)
                    }}
                  >
                    <X />
                  </Button>
                </div>
              ) : null}
            </div>

            <FieldError errors={[fieldState.error]} />
            {!fieldState.error && helperText ? (
              <FieldDescription>{helperText}</FieldDescription>
            ) : null}
          </Field>
        )
      }}
    />
  )
}
