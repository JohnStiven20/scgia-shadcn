import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useNotifications } from "@/components/notifications/NotificationsProvider"
import { useGlobalError } from "@/hooks"

import {
  useCreateAccountMutation,
  useSearchAccountsQuery,
} from "../api/accountApi"
import { mapAccountToTableRow } from "../mappers"
import type { AccountCreateFormValues, AccountFilters } from "../types"
import {
  ACCOUNT_PAGE_SIZE_OPTIONS,
  EMPTY_ACCOUNT_FILTERS,
  getActiveFilterValue,
} from "../utils"

function useAdminUsersNavigation() {
  const navigate = useNavigate()

  return {
    goToAccount: (accountId: number) => navigate(`/admin/users/${accountId}`),
  }
}

function useAdminUsersFilters() {
  const [values, setValues] = useState<AccountFilters>(EMPTY_ACCOUNT_FILTERS)

  const apply = (nextValues: AccountFilters) => {
    setValues({
      name: nextValues.name ?? "",
      typeAccount: nextValues.typeAccount,
      status: nextValues.status,
    })
  }

  const reset = () => {
    setValues(EMPTY_ACCOUNT_FILTERS)
  }

  return {
    values,
    apply,
    reset,
  }
}

function useAdminUsersPagination() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSizeState] = useState(ACCOUNT_PAGE_SIZE_OPTIONS[0])

  const setPageSize = (value: number) => {
    setPageSizeState(value)
    setPage(1)
  }

  const reset = () => {
    setPage(1)
  }

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    reset,
  }
}

function useAdminUsersData(
  filters: AccountFilters,
  pagination: { page: number; pageSize: number }
) {
  const queryParams = useMemo(
    () => ({
      name: filters.name.trim() || undefined,
      typeAccount:
        filters.typeAccount === "ALL" ? undefined : filters.typeAccount,
      active: getActiveFilterValue(filters.status),
      page: pagination.page - 1,
      size: pagination.pageSize,
      sort: ["id,desc"],
    }),
    [filters, pagination.page, pagination.pageSize]
  )

  const {
    data: accountsPage,
    isLoading,
    isFetching,
    isError,
  } = useSearchAccountsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  })

  const rows = useMemo(
    () => accountsPage?.content.map(mapAccountToTableRow) ?? [],
    [accountsPage]
  )

  return {
    rows,
    totalPages: Math.max(1, accountsPage?.totalPages ?? 1),
    totalElements: accountsPage?.totalElements ?? 0,
    currentPage: (accountsPage?.number ?? 0) + 1,
    currentSize: accountsPage?.size ?? pagination.pageSize,
    isLoading,
    isFetching,
    isError,
  }
}

function useCreateAccountFlow() {
  const notifications = useNotifications()
  const [open, setOpen] = useState(false)
  const [createAccount, { isLoading }] = useCreateAccountMutation()
  const { handleError } = useGlobalError()

  const submit = async (values: AccountCreateFormValues) => {
    try {
      await createAccount(values).unwrap()
      notifications.success("Cuenta creada correctamente.")
      setOpen(false)
    } catch (error) {
      handleError(error, "No se pudo crear la cuenta.")
    }
  }

  return {
    open,
    setOpen,
    isSubmitting: isLoading,
    submit,
  }
}

export function useAdminUsersPage() {
  const navigation = useAdminUsersNavigation()
  const filters = useAdminUsersFilters()
  const pagination = useAdminUsersPagination()
  const data = useAdminUsersData(filters.values, pagination)
  const createAccount = useCreateAccountFlow()
  const safePage = Math.min(pagination.page, data.totalPages)

  const applyFilters = (values: AccountFilters) => {
    pagination.reset()
    filters.apply(values)
  }

  const resetFilters = () => {
    pagination.reset()
    filters.reset()
  }

  return {
    filters: {
      values: filters.values,
      apply: applyFilters,
      reset: resetFilters,
    },
    pagination: {
      page: safePage,
      setPage: pagination.setPage,
      pageSize: pagination.pageSize,
      setPageSize: pagination.setPageSize,
      totalPages: data.totalPages,
      totalElements: data.totalElements,
      currentSize: data.currentSize,
      reset: pagination.reset,
    },
    createAccount,
    navigation,
    data: {
      rows: data.rows,
      isLoading: data.isLoading || data.isFetching,
      isError: data.isError,
      currentPage: data.currentPage,
    },
  }
}
