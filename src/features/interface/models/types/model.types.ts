export type ModelCategory = "SPECIFIC" | "GENERIC"
export type ModelSort = "RECENT" | "OLDEST" | "NAME_ASC" | "NAME_DESC"
export type ModelStatusFilter = "ALL" | "ACTIVE" | "INACTIVE"
export type SidePanelMode =
  | "CLOSED"
  | "DETAIL"
  | "CREATE_MODEL"
  | "EDIT_MODEL"
  | "CREATE_IDENTIFIER"
  | "EDIT_IDENTIFIER"
  | "CONFIRM_MODEL_DELETE"
  | "CONFIRM_IDENTIFIER_DELETE"

export interface ProviderResponse {
  id: number
  name: string
  active: boolean
  createdDate: string
  updatedDate: string
}

export interface TelecommunicationItemModelResponse {
  id: number
  name: string
  description: string | null
  provider: ProviderResponse | null
  telecommunicationItemType: ModelCategory
  identifierCount: number
  createdDate: string
  updatedDate: string
  editable: boolean
  deletable: boolean
  active: boolean
}

export interface TelecommunicationItemModelIdentifierResponse {
  id: number
  code: string
  active: boolean
  mutable: boolean
}

export interface ModelFormValues {
  name: string
  description: string
  providerId: number
  telecommunicationItemType: ModelCategory
  active: boolean
}

export interface CreateModelRequest {
  name: string
  description: string | null
  providerId: number
  telecommunicationItemType: ModelCategory
  active: boolean
}

export type UpdateModelRequest = CreateModelRequest

export interface PartialUpdateModelRequest {
  description: string | null
  active: boolean
}

export interface IdentifierFormValues {
  code: string
  active: boolean
}

export interface CreateIdentifierRequest {
  code: string
  telecommunicationItemModelId: number
  active: boolean
}

export interface UpdateIdentifierRequest {
  code: string
  active: boolean
}

export interface ClientModelPage {
  content: TelecommunicationItemModelResponse[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
