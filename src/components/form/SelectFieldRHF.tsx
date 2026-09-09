import { useMemo, useState, type ReactNode } from "react"
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
import { Check, ChevronsUpDown, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { FieldOnChange, SelectOption } from "./types"

type SelectFieldRHFProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  name: TName
  label: string
  options: SelectOption<FieldPathValue<TFieldValues, TName>>[]
  control: Control<TFieldValues>
  placeholder?: string
  searchPlaceholder?: string
  searchValue?: string
  emptyText?: string
  isLoading?: boolean
  inlineLabel?: boolean
  helperText?: string
  disabled?: boolean
  hidden?: boolean
  className?: string
  adornment?: {
    start?: ReactNode
    end?: ReactNode
  }
  rules?: ControllerProps<TFieldValues, TName>["rules"]
  onChangeField?: FieldOnChange<TFieldValues, TName>
  onSearchChange?: (value: string) => void
  setValue?: UseFormSetValue<TFieldValues>
  getValues?: UseFormGetValues<TFieldValues>
  resetField?: UseFormResetField<TFieldValues>
}

export function SelectFieldRHF<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  label,
  options,
  control,
  placeholder = "Selecciona una opcion",
  searchPlaceholder = "Buscar...",
  searchValue,
  emptyText = "Sin resultados",
  isLoading = false,
  inlineLabel = false,
  helperText,
  disabled,
  hidden,
  className,
  adornment,
  rules,
  onChangeField,
  onSearchChange,
  setValue,
  getValues,
  resetField,
}: SelectFieldRHFProps<TFieldValues, TName>) {
  const [open, setOpen] = useState(false)
  const [internalSearch, setInternalSearch] = useState("")
  const search = searchValue ?? internalSearch

  function handleSearchChange(value: string) {
    setInternalSearch(value)
    onSearchChange?.(value)
  }

  const filteredOptions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    if (!normalizedSearch) {
      return options
    }

    return options.filter((option) =>
      option.label.toLowerCase().includes(normalizedSearch)
    )
  }, [options, search])

  if (hidden) {
    return null
  }

  return (
    <Controller
      name={name}
      rules={rules}
      control={control}
      render={({ field, fieldState }) => {
        const selectedOption =
          options.find((option) => option.value === field.value) ?? null

        return (
          <Field
            className={className}
            data-disabled={disabled || undefined}
            data-invalid={fieldState.invalid || undefined}
          >
            {!inlineLabel ? (
              <FieldLabel htmlFor={name}>{label}</FieldLabel>
            ) : null}

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger
                render={
                  <Button
                    id={name}
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    className="h-9 w-full justify-between px-3 font-normal"
                  />
                }
              >
                <span className="flex min-w-0 items-center gap-2">
                  {adornment?.start}
                  <span
                    className={cn(
                      "truncate",
                      !selectedOption && "text-muted-foreground"
                    )}
                  >
                    {selectedOption?.label ?? (inlineLabel ? label : placeholder)}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1 text-muted-foreground">
                  {adornment?.end}
                  <ChevronsUpDown className="size-4" />
                </span>
              </PopoverTrigger>

              <PopoverContent className="w-(--anchor-width) gap-2 p-2" align="start">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    placeholder={searchPlaceholder}
                    className="h-8 pl-7"
                    onChange={(event) => handleSearchChange(event.target.value)}
                  />
                </div>

                <div className="max-h-56 overflow-y-auto">
                  {isLoading ? (
                    <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                      Cargando...
                    </p>
                  ) : null}

                  {!isLoading && filteredOptions.length === 0 ? (
                    <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                      {emptyText}
                    </p>
                  ) : null}

                  {!isLoading ? filteredOptions.map((option) => {
                    const selected = option.value === field.value

                    return (
                      <button
                        key={String(option.value)}
                        type="button"
                        disabled={option.disabled}
                        className={cn(
                          "flex min-h-8 w-full items-center gap-2 rounded-md px-2 text-left text-xs hover:bg-muted disabled:pointer-events-none disabled:opacity-50",
                          selected && "bg-muted"
                        )}
                        onClick={() => {
                          field.onChange(option.value)
                          setOpen(false)
                          handleSearchChange("")

                          if (
                            onChangeField &&
                            setValue &&
                            getValues &&
                            resetField
                          ) {
                            onChangeField(option.value, {
                              setValue,
                              getValues,
                              resetField,
                            })
                          }
                        }}
                      >
                        <Check
                          className={cn(
                            "size-3.5",
                            selected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className="truncate">{option.label}</span>
                      </button>
                    )
                  }) : null}
                </div>
              </PopoverContent>
            </Popover>

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
