import type {
  FieldPath,
  FieldPathValue,
  FieldValues,
  UseFormGetValues,
  UseFormResetField,
  UseFormSetValue,
} from "react-hook-form"

export type SelectOption<TValue = string> = {
  label: string
  value: TValue
  disabled?: boolean
}

export type FieldOnChange<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = (
  value: FieldPathValue<TFieldValues, TName>,
  helpers: {
    setValue: UseFormSetValue<TFieldValues>
    getValues: UseFormGetValues<TFieldValues>
    resetField: UseFormResetField<TFieldValues>
  }
) => void
