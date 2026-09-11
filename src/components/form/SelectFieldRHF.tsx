import { useMemo, useState, type ReactNode } from "react"
import {
  useController,
  type Control,
  type ControllerProps,
  type FieldPath,
  type FieldPathValue,
  type FieldValues,
  type UseFormGetValues,
  type UseFormResetField,
  type UseFormSetValue,
} from "react-hook-form"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox"

import { Button } from "@/components/ui/button"
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

  const { field, fieldState } = useController({
    name,
    rules,
    control,
  })

  if (hidden) {
    return null
  }

  const selectedOption =
    options.find((option) => option.value === field.value) ?? null

  return (
    <Combobox
      items={options}
      filteredItems={filteredOptions}
      value={selectedOption}
      disabled={disabled}
      isItemEqualToValue={(item, value) => item.value === value.value}
      itemToStringLabel={(option) => option.label}
      itemToStringValue={(option) => String(option.value)}
      onInputValueChange={(value) => handleSearchChange(value)}
      onValueChange={(option) => {

        if (!option) return

        field.onChange(option.value)
        handleSearchChange("")

        if (onChangeField && setValue && getValues && resetField) {
          onChangeField(option.value, {
            setValue,
            getValues,
            resetField,
          })
        }
      }}
    >
      <ComboboxTrigger
        render={
          <Button
            id={name}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-invalid={fieldState.invalid}
            className={cn(
              "w-full justify-between px-3 font-normal",
              className
            )}
          />
        }
      >
        <span className="flex min-w-0 items-center gap-2">
          {adornment?.start}
          <ComboboxValue
            placeholder={inlineLabel ? label : placeholder}
            className={cn(
              "truncate",
              !selectedOption && "text-muted-foreground"
            )}
          />
          {adornment?.end}
        </span>
      </ComboboxTrigger>

      <ComboboxContent>
        <ComboboxInput
          showTrigger={false}
          placeholder={searchPlaceholder}
          disabled={disabled}
        />
        {isLoading ? <ComboboxEmpty>Cargando...</ComboboxEmpty> : null}
        {!isLoading ? (
          <>
            <ComboboxEmpty>{emptyText}</ComboboxEmpty>
            <ComboboxList>
              {(option) => (
                <ComboboxItem
                  key={String(option.value)}
                  value={option}
                  disabled={option.disabled}
                >
                  {option.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </>
        ) : null}
      </ComboboxContent>
    </Combobox>
  )
}
