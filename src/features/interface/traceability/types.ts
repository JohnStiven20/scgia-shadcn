export type InventoryMovementType = "ENTRY" | "ASSIGNMENT" | "RETURN" | "EXIT"

export type ResourceType = "SPECIFIC" | "GENERIC"

export type SortOrder = "ASC" | "DESC"

export interface TraceabilityImage {
  id: number
  fileName: string
  fileUrl: string
  contentType: string
  uploadedAt: string
}

export interface TelecommunicationMovement {
  images: TraceabilityImage[]
  quantity: number | null
  stockAfterMovement: number | null
  stockBeforeMovement: number | null
  telecommunicationMovementId: number
  unitCode: string | null
}

export interface MovementIdentifierGroup {
  identifierType: string | null
  movements: TelecommunicationMovement[]
}

export interface MovementModelGroup {
  modelName: string
  providerName?: string | null
  identifierGroups: MovementIdentifierGroup[]
}

export interface MovementResourceGroup {
  length: number
  resourceType: ResourceType
  models: MovementModelGroup[]
}

export interface MovementTransaction {
  id: number
  performedByAccountUsername: string | null
  toAccountUsername: string | null
  fromAccountUsername: string | null
  fromWarehouseName: string | null
  inventoryMovementType: InventoryMovementType
  movementDate: string
  specificItemCount: number | null
  genericQuantity: number | null
  warehouseName: string | null
  modelNames: string[]
  eventImages: TraceabilityImage[]
  detailsMovements: MovementResourceGroup[]
}

export interface TraceabilityFilterRequest {
  startDate: string
  endDate: string
  performedByAccountUsername?: string
  fromWarehouseName?: string
}

export interface TraceabilitySearchRequest {
  pageNumber: number
  pageSize: number
  sortBy: string
  sortOrder: SortOrder
  object: TraceabilityFilterRequest
}

export interface TraceabilityPageResponse {
  content: MovementTransaction[]
  page: number
  size: number
  numberOfElements: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  empty: boolean
  hasNext: boolean
  hasPrevious: boolean
}

export interface TraceabilityFilters {
  startDate: string
  endDate: string
  performedByAccountUsername: string
  fromWarehouseName: string
}

export interface GalleryContext {
  title: string
  images: TraceabilityImage[]
  initialIndex: number
}
