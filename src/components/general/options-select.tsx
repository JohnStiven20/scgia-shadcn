import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"

type OptionValue = string | number

export type SelectOption<TValue extends OptionValue = string> = {
  label: string
  value: TValue
}

type OptionsSelectProps<TValue extends OptionValue = string> = {
  id: string
  label?: string
  options: readonly SelectOption<TValue>[]
  value: TValue
  onChange: (value: TValue) => void
  name?: string
  placeholder?: string
  className?: string
}

export function OptionsSelect<TValue extends OptionValue = string>({
  id,
  label,
  options,
  value,
  onChange,
  name,
  placeholder = "Selecciona una opcion",
  className,
}: OptionsSelectProps<TValue>) {
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? placeholder

  return (
    <div className={className ?? "grid gap-1.5"}>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <Select
        name={name}
        value={String(value)}
        onValueChange={(nextValue) => {
          const selectedOption = options.find(
            (option) => String(option.value) === nextValue
          )

          if (selectedOption) {
            onChange(selectedOption.value)
          }
        }}
      >
        <SelectTrigger id={id} className="w-full">
          <span>{selectedLabel}</span>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={String(option.value)} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export type { OptionsSelectProps }
