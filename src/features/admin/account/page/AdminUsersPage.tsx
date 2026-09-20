import { Plus } from "lucide-react"

import { DataTable } from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import { useAuthAccess } from "@/features/auth/hooks/useAuthAccess"

import { CreateAccountDialog } from "../components/CreateAccountDialog"
import { useAdminUsersPage } from "../hooks/useAdminUsersPage"

import { accountColumns } from "../ui/accountColumns"
import { ACCOUNT_PAGE_SIZE_OPTIONS } from "../utils"
import { AccountFilters } from "../components/AccountFilters"
export function AdminUsersPage() {
  const { filters, pagination, createAccount, navigation, data } =
    useAdminUsersPage()
  const { hasPermission } = useAuthAccess()
  const canCreateAccount = hasPermission("account.create")

  return (
    <section className="flex min-w-0 flex-col gap-6" aria-label="Cuentas">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight">Cuentas</h1>
          <p className="text-muted-foreground">
            Consulta y gestiona las cuentas del sistema.
          </p>
        </section>
        {canCreateAccount ? (
          <Button
            type="button"
            size="lg"
            onClick={() => createAccount.setOpen(true)}
          >
            <Plus />
            Nueva cuenta
          </Button>
        ) : null}
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

      {canCreateAccount ? (
        <CreateAccountDialog
          open={createAccount.open}
          loading={createAccount.isSubmitting}
          onClose={() => createAccount.setOpen(false)}
          onSubmit={createAccount.submit}
        />
      ) : null}
    </section>
  )
}
