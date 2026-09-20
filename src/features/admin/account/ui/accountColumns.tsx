import { createColumnHelper } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table/data-table"
import type { DataTableFeatures } from "@/components/data-table/data-table-features"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import type { AccountTableRow } from "../types"
import { AccountTypeBadge } from "./AccountTypeBadge"

const columnHelper = createColumnHelper<DataTableFeatures, AccountTableRow>()

function getAccountDisplayName(username: string) {
  const name = username.includes("@") ? username.split("@")[0] : username

  return name.trim() || "-"
}

export const accountColumns = columnHelper.columns([
  columnHelper.accessor("code", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Codigo" />
    ),
    size: 150,
    minSize: 120,
    cell: ({ row }) => (
      <span className="font-semibold text-slate-950">{row.original.code}</span>
    ),
  }),
  columnHelper.accessor("username", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Usuario" />
    ),
    size: 300,
    minSize: 220,
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="size-9">
          <AvatarFallback className="bg-orange-100 font-semibold text-orange-700">
            {row.original.initial}
          </AvatarFallback>
        </Avatar>
        <span className="min-w-0 truncate font-medium">
          {getAccountDisplayName(row.original.username)}
        </span>
      </div>
    ),
  }),
  columnHelper.accessor("typeAccount", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo" />
    ),
    size: 160,
    minSize: 130,
    cell: ({ row }) => <AccountTypeBadge account={row.original} />,
  }),
  columnHelper.accessor("isactive", {
    header: "Estado",
    size: 160,
    minSize: 130,
    enableSorting: false,
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-2 font-medium">
        <span
          aria-hidden="true"
          className={
            row.original.isactive
              ? "size-3 rounded-full bg-emerald-600"
              : "size-3 rounded-full bg-slate-400"
          }
        />
        {row.original.isactive ? "Activa" : "Inactiva"}
      </span>
    ),
  }),
  columnHelper.accessor("createdAt", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Creada" />
    ),
    size: 170,
    minSize: 140,
  }),
])
