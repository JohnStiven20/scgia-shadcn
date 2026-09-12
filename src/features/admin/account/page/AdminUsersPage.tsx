import { useState } from "react"
import { createColumnHelper } from "@tanstack/react-table"
import {
  Funnel,
  Laptop,
  MonitorSmartphone,
  Plus,
  RotateCcw,
  Search,
  Smartphone,
} from "lucide-react"

import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/data-table/data-table"
import type { DataTableFeatures } from "@/components/data-table/data-table-features"
import { useNotifications } from "@/components/notifications/NotificationsProvider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import type { TypeAccount } from "@/features/interface/account/enum/type-account"

import { CreateAccountDialog } from "../components/CreateAccountDialog"
import { useAdminUsersPage } from "../hooks/useAdminUsersPage"
import type {
  AccountFilters,
  AccountStatusFilter,
  AccountTableRow,
} from "../types"
import {
  ACCOUNT_PAGE_SIZE_OPTIONS,
  ACCOUNT_STATUS_LABELS,
  ACCOUNT_TYPE_LABELS,
  EMPTY_ACCOUNT_FILTERS,
} from "../utils"

const columnHelper = createColumnHelper<DataTableFeatures, AccountTableRow>()

function AccountTypeBadge({ account }: { account: AccountTableRow }) {
  const Icon =
    account.typeAccount === "MOBILE"
      ? Smartphone
      : account.typeAccount === "BOTH"
        ? MonitorSmartphone
        : Laptop

  return (
    <span className="inline-flex items-center gap-2">
      <Icon className="size-4 text-slate-500" />
      <Badge
        variant="outline"
        className="border-blue-100 bg-blue-50 text-blue-700"
      >
        {ACCOUNT_TYPE_LABELS[account.typeAccount]}
      </Badge>
    </span>
  )
}

function getAccountDisplayName(username: string) {
  const name = username.includes("@") ? username.split("@")[0] : username

  return name.trim() || "-"
}

function getAccountEmail(username: string) {
  return username.includes("@") ? username : "-"
}

function getAccountTypeFilterLabel(value: AccountFilters["typeAccount"]) {
  return value === "ALL" ? "Todos" : ACCOUNT_TYPE_LABELS[value]
}

function getAccountStatusFilterLabel(value: AccountStatusFilter) {
  return ACCOUNT_STATUS_LABELS[value]
}

const accountColumns = columnHelper.columns([
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
  // columnHelper.accessor("username",
  //   {
  //   id: "email",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Correo" />
  //   ),
  //   size: 320,
  //   minSize: 220,
  //   cell: ({ row }) => (
  //     <span className="text-slate-950">
  //       {getAccountEmail(row.original.username)}
  //     </span>
  //   ),
  // }
  // ),
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

type AccountFiltersProps = {
  values: AccountFilters
  onApply: (values: AccountFilters) => void
  onReset: () => void
}

function AccountFilters({ values, onApply, onReset }: AccountFiltersProps) {
  const [draft, setDraft] = useState<AccountFilters>(values)

  return (
    <section className="flex flex-col gap-6" aria-label="Filtros de cuentas">
      <form
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault()
          onApply(draft)
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="account-name">Usuario</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="account-name"
              name="name"
              placeholder="Buscar usuario"
              value={draft.name}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              className="h-8 pl-8"
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="account-type">Tipo de cuenta</Label>
          <Select
            value={draft.typeAccount}
            onValueChange={(value) =>
              setDraft((current) => ({
                ...current,
                typeAccount: value as TypeAccount | "ALL",
              }))
            }
          >
            <SelectTrigger id="account-type" className="h-8 w-full">
              <span>{getAccountTypeFilterLabel(draft.typeAccount)}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="account-status">Estado</Label>
          <Select
            value={draft.status}
            onValueChange={(value) =>
              setDraft((current) => ({
                ...current,
                status: value as AccountStatusFilter,
              }))
            }
          >
            <SelectTrigger id="account-status" className="h-8 w-full">
              <span>{getAccountStatusFilterLabel(draft.status)}</span>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ACCOUNT_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-end justify-end gap-3 sm:col-span-2 lg:col-span-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setDraft(EMPTY_ACCOUNT_FILTERS)
              onReset()
            }}
          >
            <RotateCcw />
            Limpiar
          </Button>
          <Button type="submit">
            <Funnel />
            Aplicar filtros
          </Button>
        </div>
      </form>
    </section>
  )
}

export function AdminUsersPage() {
  const { filters, pagination, createAccount, navigation, data } =
    useAdminUsersPage()

  return (
    <section className="flex min-w-0 flex-col gap-6" aria-label="Cuentas">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight">Cuentas</h1>
          <p className="text-muted-foreground">
            Consulta y gestiona las cuentas del sistema.
          </p>
        </section>
        <Button
          type="button"
          size="lg"
          onClick={() => createAccount.setOpen(true)}
        >
          <Plus />
          Nueva cuenta
        </Button>
      </header>

      <AccountFilters
        values={filters.values}
        onApply={filters.apply}
        onReset={filters.reset}
      />

      <section aria-label="Listado de cuentas">
        <DataTable
          columns={accountColumns}
          data={data.rows}
          getRowId={(account) => String(account.id)}
          onRowClick={(account) => navigation.goToAccount(account.id)}
          isLoading={data.isLoading}
          serverPagination={{
            page: pagination.page,
            pageSize: pagination.pageSize,
            totalPages: pagination.totalPages,
            totalElements: pagination.totalElements,
            onPageChange: pagination.setPage,
            pageSizeOptions: ACCOUNT_PAGE_SIZE_OPTIONS,
            onPageSizeChange: pagination.setPageSize,
          }}
          ariaLabel="Listado de cuentas"
          emptyMessage={
            data.isError
              ? "No se pudieron cargar las cuentas."
              : "No hay cuentas que coincidan."
          }
        />
      </section>

      <CreateAccountDialog
        open={createAccount.open}
        loading={createAccount.isSubmitting}
        onClose={() => createAccount.setOpen(false)}
        onSubmit={createAccount.submit}
      />
    </section>
  )
}
