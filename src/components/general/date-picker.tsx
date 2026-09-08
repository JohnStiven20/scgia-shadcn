import { useState } from "react"
import { format, isAfter, isBefore, startOfDay } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type DatePickerProps = {
  id: string
  label: string
  value?: Date
  onChange: (date: Date) => void
  placeholder?: string
  minDate?: Date
  maxDate?: Date
  className?: string
}

export function DatePicker({
  id,
  label,
  value,
  onChange,
  placeholder = "Selecciona una fecha",
  minDate,
  maxDate,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)

  const isDisabled = (date: Date) => {
    const day = startOfDay(date)

    return (
      (minDate ? isBefore(day, startOfDay(minDate)) : false) ||
      (maxDate ? isAfter(day, startOfDay(maxDate)) : false)
    )
  }

  return (
    <Field className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              data-empty={!value}
              className={cn(
                "w-full justify-start px-2.5 text-left font-normal",
                "data-[empty=true]:text-muted-foreground"
              )}
            />
          }
        >
          <CalendarIcon />
          {value ? format(value, "dd/MM/yyyy", { locale: es }) : placeholder}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            locale={es}
            defaultMonth={value}
            selected={value}
            disabled={isDisabled}
            onSelect={(date) => {
              if (!date) return

              onChange(date)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </Field>
  )
}

export type { DatePickerProps }
