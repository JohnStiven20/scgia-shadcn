"use client"

import * as React from "react"

import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxList,
    ComboboxValue,
    useComboboxAnchor,
} from "@/components/ui/combobox"
import type { InventoryMovementType } from "@/features/interface/traceability/types"

type ComboboxMultipleProps = {
    id?: string
    onValueChange: (value: InventoryMovementType[]) => void
    valor?: InventoryMovementType[]
}

export function ComboboxMultiple({
    id = "frameworks",
    valor = [],
    onValueChange,
}: ComboboxMultipleProps) {


    const anchor = useComboboxAnchor()

    const options = [
        { label: "Entrada", value: "ENTRY" },
        { label: "Salida", value: "EXIT" },
        { label: "Transferencia", value: "TRANSFER" },
        { label: "Asignación", value: "ASSIGNMENT" },
        { label: "Instalación", value: "INSTALLATION" },
    ] as const

    return (
        <Combobox
            id={id}
            multiple
            value={valor}
            autoHighlight
            onValueChange={(value) => {
                onValueChange(value as InventoryMovementType[])
            }}
            items={options}

        >
            <ComboboxChips ref={anchor} className="w-full min-w-50">
                <ComboboxValue>
                    {(values: InventoryMovementType[]) => (
                        <React.Fragment>
                            {values.length > 0 ? (
                                <>
                                    {values.map((value: InventoryMovementType) => (
                                        <ComboboxChip key={value}>
                                            {options.find((o) => o.value === value)?.label}
                                        </ComboboxChip>
                                    ))}
                                    <ComboboxChipsInput />
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground md:text-xs">
                                    Eventos de inventario
                                </p>
                            )}
                        </React.Fragment>
                    )}
                </ComboboxValue>
            </ComboboxChips>
            <ComboboxContent anchor={anchor}>
                <ComboboxEmpty>No items found.</ComboboxEmpty>
                <ComboboxList>
                    {(item: { label: string; value: InventoryMovementType }) => (
                        <ComboboxItem key={item.value} value={item.value}>
                            {item.label}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    )
}
