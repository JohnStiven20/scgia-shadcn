import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  createColumnHelper,
  FlexRender,
  useTable,
  type Cell,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type RowData,
  type SortingState,
  type ReactTable,
  type VisibilityState,
} from "@tanstack/react-table"
import { ChevronsUpDown, GripVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  dataTableFeatures,
  type DataTableFeatures,
} from "./data-table-features"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[]
  data: TData[]
  getRowId?: (row: TData, index: number) => string
  enableRowOrdering?: boolean
  pageSize?: number
  ariaLabel?: string
  emptyMessage?: string
  onDataChange?: (data: TData[]) => void
  onRowClick?: (row: TData) => void
  selectedRowId?: string
  serverPagination?: DataTableServerPagination
  fitColumns?: boolean
  isLoading?: boolean
  renderToolbar?: (
    table: ReactTable<DataTableFeatures, TData>
  ) => React.ReactNode
  initialSorting?: SortingState
  initialColumnVisibility?: VisibilityState
  pageSizeOptions?: number[]
}

export interface DataTableServerPagination {
  page: number
  pageSize: number
  totalPages: number
  totalElements: number
  onPageChange: (page: number) => void
  pageSizeOptions?: number[]
  onPageSizeChange?: (pageSize: number) => void
}

interface DataTableColumnHeaderProps<TData extends RowData, TValue> {
  column: Column<DataTableFeatures, TData, TValue>
  title: string
  className?: string
}

function getPageItems(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 3) {
    return [1, 2, 3, "ellipsis", totalPages] as const
  }

  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis", totalPages - 2, totalPages - 1, totalPages] as const
  }

  return [1, "ellipsis", currentPage, "ellipsis", totalPages] as const
}

type DragHandleContextValue = Pick<
  ReturnType<typeof useSortable>,
  "attributes" | "listeners"
>

const DragHandleContext = React.createContext<DragHandleContextValue | null>(
  null
)

export function DataTableColumnHeader<TData extends RowData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) return <span>{title}</span>

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "h-8 max-w-full min-w-0 justify-start gap-1 overflow-hidden px-1",
        className ?? "ml-0"
      )}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      <span className="min-w-0 truncate">{title}</span>
      <ChevronsUpDown className="shrink-0" />
    </Button>
  )
}

function DragHandle() {
  const sortable = React.useContext(DragHandleContext)

  return (
    <Button
      {...sortable?.attributes}
      {...sortable?.listeners}
      variant="ghost"
      size="icon"
      className="size-7"
      aria-label="Reordenar fila"
      onClick={(event) => event.stopPropagation()}
    >
      <GripVertical className="size-4 text-muted-foreground" />
    </Button>
  )
}

function RowCell<TData extends RowData>({
  cell,
  width,
  fitColumns,
}: {
  cell: Cell<DataTableFeatures, TData>
  width: number
  fitColumns: boolean
}) {
  return (
    <TableCell
      className={
        fitColumns
          ? "px-1 break-words whitespace-normal sm:px-2"
          : "px-1 sm:px-2"
      }
      style={{ width, minWidth: fitColumns ? 0 : width }}
    >
      <FlexRender cell={cell} />
    </TableCell>
  )
}

function DataTableRow<TData extends RowData>({
  row,
  orderingEnabled,
  columnWidths,
  onRowClick,
  selected,
  fitColumns,
}: {
  row: Row<DataTableFeatures, TData>
  orderingEnabled: boolean
  columnWidths: Record<string, number>
  onRowClick?: (row: TData) => void
  selected: boolean
  fitColumns: boolean
}) {
  const {
    attributes,
    listeners,
    transform,
    transition,
    setNodeRef,
    isDragging,
  } = useSortable({
    id: row.id,
    disabled: !orderingEnabled,
  })

  return (
    <DragHandleContext.Provider value={{ attributes, listeners }}>
      <TableRow
        ref={setNodeRef}
        tabIndex={onRowClick ? 0 : undefined}
        data-state={selected ? "selected" : undefined}
        aria-selected={selected || undefined}
        className={
          [
            isDragging && "relative z-10 opacity-80",
            onRowClick &&
              "cursor-pointer focus-visible:bg-muted/50 focus-visible:outline-none",
          ]
            .filter(Boolean)
            .join(" ") || undefined
        }
        style={{ transform: CSS.Transform.toString(transform), transition }}
        onClick={(event) => {
          const target = event.target
          const interactiveElement =
            target instanceof Element
              ? target.closest(
                  "button, a, input, select, textarea, [role=button], [role=menuitem]"
                )
              : null

          if (interactiveElement) return

          onRowClick?.(row.original)
        }}
        onKeyDown={(event) => {
          if (!onRowClick || (event.key !== "Enter" && event.key !== " ")) {
            return
          }

          if (event.target !== event.currentTarget) return

          event.preventDefault()
          onRowClick(row.original)
        }}
      >
        {row.getVisibleCells().map((cell) => (
          <RowCell<TData>
            key={cell.id}
            cell={cell}
            width={columnWidths[cell.column.id] ?? cell.column.getSize()}
            fitColumns={fitColumns}
          />
        ))}
      </TableRow>
    </DragHandleContext.Provider>
  )
}

export function DataTable<TData extends RowData>({
  columns,
  data: initialData,
  getRowId,
  enableRowOrdering = false,
  pageSize = 5,
  ariaLabel = "Tabla de datos",
  emptyMessage = "No hay resultados.",
  onDataChange,
  onRowClick,
  selectedRowId,
  serverPagination,
  fitColumns = false,
  isLoading = false,
  renderToolbar,
  initialSorting = [],
  initialColumnVisibility,
  pageSizeOptions,
}: DataTableProps<TData>) {
  const [data, setData] = React.useState(initialData)
  const tableContainerRef = React.useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = React.useState(0)
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting)
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize,
  })

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  )
  const sortableId = React.useId()
  const tablePagination = serverPagination
    ? { pageIndex: 0, pageSize: serverPagination.pageSize }
    : pagination
  const tableData = serverPagination || !enableRowOrdering ? initialData : data

  const resolvedColumns = React.useMemo(() => {
    if (!enableRowOrdering) return columns

    const columnHelper = createColumnHelper<DataTableFeatures, TData>()
    const dragColumn = columnHelper.display({
      id: "drag",
      header: () => null,
      cell: () => <DragHandle />,
      size: 48,
      minSize: 40,
      enableSorting: false,
      enableHiding: false,
    })

    return columnHelper.columns([dragColumn, ...columns])
  }, [columns, enableRowOrdering])

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () =>
      tableData.map((row, index) =>
        getRowId ? getRowId(row, index) : String(index)
      ),
    [tableData, getRowId]
  )

  const table = useTable({
    features: dataTableFeatures,
    data: tableData,
    columns: resolvedColumns,
    getRowId,
    initialState: {
      columnVisibility: initialColumnVisibility,
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination: tablePagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    onPaginationChange: setPagination,
  })

  React.useEffect(() => {
    const container = tableContainerRef.current
    if (!container) return undefined

    const resizeObserver = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width)
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [])

  const columnWidths = React.useMemo(() => {
    const visibleColumns = table.getVisibleLeafColumns()
    const totalWidth = visibleColumns.reduce(
      (total, column) => total + column.getSize(),
      0
    )
    const minimumWidth = visibleColumns.reduce(
      (total, column) => total + (column.columnDef.minSize ?? 80),
      0
    )
    const scale =
      containerWidth > 0 && containerWidth < totalWidth
        ? fitColumns
          ? containerWidth / totalWidth
          : Math.max(minimumWidth / totalWidth, containerWidth / totalWidth)
        : 1

    return Object.fromEntries(
      visibleColumns.map((column) => [
        column.id,
        fitColumns
          ? Math.round(column.getSize() * scale)
          : Math.max(
              column.columnDef.minSize ?? 80,
              Math.round(column.getSize() * scale)
            ),
      ])
    )
  }, [containerWidth, fitColumns, table])

  const renderedTableWidth = Object.values(columnWidths).reduce(
    (total, width) => total + width,
    0
  )

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!enableRowOrdering || !over || active.id === over.id) return

    const oldIndex = dataIds.indexOf(active.id)
    const newIndex = dataIds.indexOf(over.id)
    if (oldIndex < 0 || newIndex < 0) return

    setData((currentData) => {
      const nextData = arrayMove(currentData, oldIndex, newIndex)
      onDataChange?.(nextData)
      return nextData
    })
  }

  const currentPage =
    serverPagination?.page ?? table.state.pagination.pageIndex + 1
  const totalPages = serverPagination?.totalPages ?? table.getPageCount()
  const totalElements =
    serverPagination?.totalElements ?? table.getFilteredRowModel().rows.length
  const resolvedPageSizeOptions =
    serverPagination?.pageSizeOptions ?? pageSizeOptions
  const resolvedPageSize =
    serverPagination?.pageSize ?? table.state.pagination.pageSize

  return (
    <section
      className="flex flex-col gap-4"
      aria-label={ariaLabel}
      aria-busy={isLoading}
    >
      {renderToolbar ? renderToolbar(table) : null}

      <div
        ref={tableContainerRef}
        className="overflow-hidden rounded-md border"
      >
        <DndContext
          id={sortableId}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <Table
            style={{
              width: fitColumns ? "100%" : renderedTableWidth,
              minWidth: "100%",
            }}
          >
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const width =
                      columnWidths[header.column.id] ?? header.getSize()

                    return (
                      <TableHead
                        key={header.id}
                        className={
                          fitColumns
                            ? "px-1 whitespace-normal sm:px-2"
                            : "px-1 sm:px-2"
                        }
                        style={{ width, minWidth: fitColumns ? 0 : width }}
                      >
                        {header.isPlaceholder ? null : (
                          <table.FlexRender header={header} />
                        )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }, (_, rowIndex) => (
                  <TableRow key={`loading-row-${rowIndex}`}>
                    {table.getVisibleLeafColumns().map((column) => {
                      const width = columnWidths[column.id] ?? column.getSize()

                      return (
                        <TableCell
                          key={`loading-cell-${rowIndex}-${column.id}`}
                          className={
                            fitColumns
                              ? "px-1 whitespace-normal sm:px-2"
                              : "px-1 sm:px-2"
                          }
                          style={{
                            width,
                            minWidth: fitColumns ? 0 : width,
                          }}
                        >
                          <Skeleton className="h-4 w-full max-w-56" />
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length ? (
                <SortableContext
                  items={dataIds}
                  strategy={verticalListSortingStrategy}
                >
                  {table.getRowModel().rows.map((row) => (
                    <DataTableRow<TData>
                      key={row.id}
                      row={row}
                      orderingEnabled={enableRowOrdering}
                      columnWidths={columnWidths}
                      onRowClick={onRowClick}
                      selected={row.id === selectedRowId}
                      fitColumns={fitColumns}
                    />
                  ))}
                </SortableContext>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={resolvedColumns.length}
                    className="h-24 text-center"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center gap-3">
          <span>{totalElements} registros.</span>
          {resolvedPageSizeOptions?.length ? (
            <Field orientation="horizontal" className="w-fit">
              <span className="fw-semibold text-sm">Filas por página</span>
              <Select
                value={String(resolvedPageSize)}
                onValueChange={(value) => {
                  const nextPageSize = Number(value)

                  if (serverPagination?.onPageSizeChange) {
                    serverPagination.onPageSizeChange(nextPageSize)
                    return
                  }

                  table.setPageSize(nextPageSize)
                  table.setPageIndex(0)
                }}
              >
                <SelectTrigger className="w-20" id="select-rows-per-page">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectGroup>
                    {resolvedPageSizeOptions.map((option) => (
                      <SelectItem key={option} value={String(option)}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          ) : null}
        </div>
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                text="Anterior"
                href={currentPage > 1 ? `?page=${currentPage - 1}` : undefined}
                aria-disabled={currentPage <= 1}
                className={
                  currentPage <= 1
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
                onClick={(event) => {
                  event.preventDefault()
                  if (currentPage <= 1) return

                  if (serverPagination) {
                    serverPagination.onPageChange(currentPage - 1)
                  } else {
                    table.setPageIndex(currentPage - 2)
                  }
                }}
              />
            </PaginationItem>
            {getPageItems(currentPage, totalPages).map((page, index) => (
              <PaginationItem key={`${page}-${index}`}>
                {page === "ellipsis" ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href={`?page=${page}`}
                    isActive={page === currentPage}
                    aria-label={`Ir a la página ${page}`}
                    onClick={(event) => {
                      event.preventDefault()
                      if (page === currentPage) return

                      if (serverPagination) {
                        serverPagination.onPageChange(page)
                      } else {
                        table.setPageIndex(page - 1)
                      }
                    }}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                text="Siguiente"
                href={
                  currentPage < totalPages
                    ? `?page=${currentPage + 1}`
                    : undefined
                }
                aria-disabled={currentPage >= totalPages}
                className={
                  currentPage >= totalPages
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
                onClick={(event) => {
                  event.preventDefault()
                  if (currentPage >= totalPages) return

                  if (serverPagination) {
                    serverPagination.onPageChange(currentPage + 1)
                  } else {
                    table.setPageIndex(currentPage)
                  }
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </footer>
    </section>
  )
}

export type { DataTableProps }
