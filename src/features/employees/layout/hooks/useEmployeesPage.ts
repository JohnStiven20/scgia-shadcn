import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useNotifications } from "../../../../components/notifications/NotificationsProvider"
import { useGetWorkerTypesQuery } from "../../employee-types/api/workerTypeApi"
import {
  useCreateWorkerMutation,
  useSearchWorkersQuery,
} from "../../api/employeesApi"

import { useGlobalError } from "../../../../hooks/useGlobalError"
import type {
  CreateWorkerRequest,
  SearchWorkersParams,
} from "@/features/interface/worker/request/create-worker-request"
import type { Worker } from "@/features/interface/worker/type/worker.inteface"

export const employeeFiltersDefaultValues: SearchWorkersParams = {
  firstName: "",
  surname: "",
  dni: "",
  email: "",
  phone: "",
  employeeCode: "",
  workerTypeId: undefined,
  active: undefined,
  page: undefined,
  size: undefined,
  sort: undefined,
}

export const CARD_PAGE_SIZE_OPTIONS = [8, 16, 24]

function useEmployeesNavigation() {
  const navigate = useNavigate()

  return {
    goToWorker: (workerId: number) => navigate(`/employees/worker/${workerId}`),
  }
}

function useEmployeesFilters() {
  const [values, setValues] = useState<SearchWorkersParams>(
    employeeFiltersDefaultValues
  )

  const apply = async (nextValues: SearchWorkersParams) => {
    setValues({
      firstName: nextValues.firstName ?? "",
      surname: nextValues.surname ?? "",
      dni: nextValues.dni ?? "",
      email: nextValues.email ?? "",
      phone: nextValues.phone ?? "",
      employeeCode: nextValues.employeeCode ?? "",
      workerTypeId: nextValues.workerTypeId,
      active: nextValues.active,
      page: 0,
      size: 20,
      sort: nextValues.sort,
    })
  }

  const reset = () => {
    setValues(employeeFiltersDefaultValues)
  }

  return {
    values,
    apply,
    reset,
  }
}

function useEmployeesPagination() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSizeState] = useState(CARD_PAGE_SIZE_OPTIONS[0])

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

function useEmployeesWorkersData(
  filters: SearchWorkersParams,
  pagination: { page: number; pageSize: number }
) {
  const queryParams = useMemo(
    () => ({
      firstName: filters.firstName?.trim() || undefined,
      surname: filters.surname?.trim() || undefined,
      dni: filters.dni?.trim() || undefined,
      email: filters.email?.trim() || undefined,
      phone: filters.phone?.trim() || undefined,
      employeeCode: filters.employeeCode?.trim() || undefined,
      workerTypeId: filters.workerTypeId || undefined,
      active: filters.active,
      page: pagination.page - 1,
      size: pagination.pageSize,
      sort: filters.sort,
    }),
    [filters, pagination.page, pagination.pageSize]
  )

  const {
    data: searchedWorkersPage,
    isFetching,
    isLoading,
  } = useSearchWorkersQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  })

  const rows = useMemo<Worker[]>(
    () =>
      ((searchedWorkersPage?.content as unknown as Worker[]) ?? []) as Worker[],
    [searchedWorkersPage?.content]
  )

  const totalPages = Math.max(1, searchedWorkersPage?.totalPages ?? 1)
  const totalElements = searchedWorkersPage?.totalElements ?? 0
  const currentPage = (searchedWorkersPage?.number ?? 0) + 1
  const currentSize = searchedWorkersPage?.size ?? pagination.pageSize

  return {
    rows,
    totalPages,
    totalElements,
    currentPage,
    currentSize,
    isLoading,
    isFetching,
  }
}

function useVisiblePaginationWindow(page: number, totalPages: number) {
  return useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1)
    }

    const startPage = Math.max(1, Math.min(page - 2, totalPages - 4))
    return Array.from({ length: 5 }, (_, index) => startPage + index)
  }, [page, totalPages])
}

function useCreateWorkerFlow() {
  const notifications = useNotifications()
  const [open, setOpen] = useState(false)
  const [createWorker, { isLoading }] = useCreateWorkerMutation()
  const { handleError } = useGlobalError()

  type CreateWorkerFormValues = Omit<CreateWorkerRequest, "name"> & {
    firstName: string
  }

  const submit = async (values: CreateWorkerFormValues) => {
    try {
      await createWorker({
        name: values.firstName.trim(),
        surname: values.surname.trim(),
        dni: values.dni.trim(),
        email: values.email.trim(),
        phone: values.phone?.trim() || null,
        active: values.active,
        observations: values.observations?.trim() || null,
        employeeCode: values.employeeCode.trim(),
        workerTypeId: Number(values.workerTypeId),
      })

      notifications.success("Trabajador creado correctamente.")
      setOpen(false)
    } catch (error) {
      handleError(error)
    }
  }

  return {
    open,
    setOpen,
    isSubmitting: isLoading,
    submit,
  }
}

export function useEmployeesPage() {
  const navigation = useEmployeesNavigation()
  const filters = useEmployeesFilters()
  const pagination = useEmployeesPagination()
  const data = useEmployeesWorkersData(filters.values, pagination)
  const createWorker = useCreateWorkerFlow()
  const { data: workerTypesPage } = useGetWorkerTypesQuery({
    page: 0,
    size: 50,
    sort: ["name,asc"],
  })

  const safePage = Math.min(pagination.page, data.totalPages)
  const visiblePages = useVisiblePaginationWindow(safePage, data.totalPages)

  const applyFilters = async (values: SearchWorkersParams) => {
    pagination.reset()
    await filters.apply(values)
  }

  const resetFilters = () => {
    pagination.reset()
    filters.reset()
  }

  return {
    filters: {
      values: filters.values,
      rows: data.rows,
      workerTypes: workerTypesPage?.content ?? [],
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
      visiblePages,
      reset: pagination.reset,
    },
    createWorker: {
      open: createWorker.open,
      setOpen: createWorker.setOpen,
      isSubmitting: createWorker.isSubmitting,
      submit: createWorker.submit,
    },
    navigation,
    data: {
      isLoading: data.isLoading,
      isFetching: data.isFetching,
      rows: data.rows,
      currentPage: data.currentPage,
    },
  }
}
