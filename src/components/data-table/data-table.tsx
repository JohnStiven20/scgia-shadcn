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
} from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  GripVertical,
} from "lucide-react"

import { Button } from "@/components/ui/button"
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

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[]
  data: TData[]
  getRowId?: (row: TData, index: number) => string
  enableRowOrdering?: boolean
  pageSize?: number
  ariaLabel?: string
  emptyMessage?: string
  onDataChange?: (data: TData[]) => void
}

interface DataTableColumnHeaderProps<TData extends RowData, TValue> {
  column: Column<DataTableFeatures, TData, TValue>
  title: string
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
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) return <span>{title}</span>

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <ChevronsUpDown />
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
    >
      <GripVertical className="size-4 text-muted-foreground" />
    </Button>
  )
}

function RowCell<TData extends RowData>({
  cell,
  width,
}: {
  cell: Cell<DataTableFeatures, TData>
  width: number
}) {
  return (
    <TableCell className="px-1 sm:px-2" style={{ width, minWidth: width }}>
      <FlexRender cell={cell} />
    </TableCell>
  )
}

function DataTableRow<TData extends RowData>({
  row,
  orderingEnabled,
  columnWidths,
}: {
  row: Row<DataTableFeatures, TData>
  orderingEnabled: boolean
  columnWidths: Record<string, number>
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
        className={isDragging ? "relative z-10 opacity-80" : undefined}
        style={{ transform: CSS.Transform.toString(transform), transition }}
      >
        {row.getVisibleCells().map((cell) => (
          <RowCell<TData>
            key={cell.id}
            cell={cell}
            width={columnWidths[cell.column.id] ?? cell.column.getSize()}
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
}: DataTableProps<TData>) {
  const [data, setData] = React.useState(initialData)
  const tableContainerRef = React.useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = React.useState(0)
  const [sorting, setSorting] = React.useState<SortingState>([])
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
      data.map((row, index) =>
        getRowId ? getRowId(row, index) : String(index)
      ),
    [data, getRowId]
  )

  const table = useTable({
    features: dataTableFeatures,
    data,
    columns: resolvedColumns,
    getRowId,
    state: { sorting, columnFilters, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
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
        ? Math.max(minimumWidth / totalWidth, containerWidth / totalWidth)
        : 1

    return Object.fromEntries(
      visibleColumns.map((column) => [
        column.id,
        Math.max(
          column.columnDef.minSize ?? 80,
          Math.round(column.getSize() * scale)
        ),
      ])
    )
  }, [containerWidth, table])

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

  return (
    <section className="flex flex-col gap-4" aria-label={ariaLabel}>
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
            className="table-fixed"
            style={{ width: renderedTableWidth, minWidth: "100%" }}
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
                        className="px-1 sm:px-2"
                        style={{ width, minWidth: width }}
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
              {table.getRowModel().rows.length ? (
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
        <span>{table.getFilteredRowModel().rows.length} registros.</span>
        <div className="flex items-center gap-2">
          <span>
            Página {table.state.pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Página anterior"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Página siguiente"
          >
            <ChevronRight />
          </Button>
        </div>
      </footer>
    </section>
  )
}

export type { DataTableProps }
