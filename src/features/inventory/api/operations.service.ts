import { baseQueryWithAuth } from "@/api/rtkBaseQuery"
import { createApi } from "@reduxjs/toolkit/query/react"
import type { IdentificationUniqueCodeType } from "@/features/interface/identification/types"

const OPERATION_BASE_URL = "/telecommunication-item"

export interface RegisterGenericEntryItemRequest {
  quantity: number
  telecommunicationGenericId: number
  identifierId: number
}

export interface RegisterSpecificEntryItemRequest {
  uniqueCode: string
  uniqueCodeType: IdentificationUniqueCodeType
  telecommunicationItemModelId: number
  telecommunicationItemModelIdentifierId: number
}

export interface RegisterTelecommunicationsItemsRequest {
  genericItems: RegisterGenericEntryItemRequest[]
  specificItems: RegisterSpecificEntryItemRequest[]
}

export interface ExitSpecificItemRequest {
  telecommunicationsItemId: number
  remarks: string
}

export interface ExitGenericItemRequest {
  telecommunicationGenericId: number
  identifierId: number
  quantity: number
  remarks: string
}

export interface ExitTelecommunicationsItemsRequest {
  specificItems: ExitSpecificItemRequest[]
  genericItems: ExitGenericItemRequest[]
}

export interface AssignmentGenericItemRequest {
  telecommunicationGenericItemId: number
  quantity: number
  identifierId: number
  imageKeys: string[]
}

export interface AssignmentSpecificItemRequest {
  telecommunicationItemId: number
  imageKeys: string[]
}

export interface AssignmentCreateRequest {
  accountId: number
  notes: string
  imageKeys: string[]
  generalItems: AssignmentGenericItemRequest[]
  specialItems: AssignmentSpecificItemRequest[]
}

export interface ReturnSpecificItemRequest {
  assignmentTelecommunicationItemId: number
  telecommunicationItemId: number
  imageKeys: string[]
}

export interface ReturnGenericItemRequest {
  assignmentTelecommunicationGenericItemId: number
  telecommunicationGenericItemId: number
  quantity: number
  imageKeys: string[]
}

export interface ReturnTelecommunicationsItemsRequest {
  // The backend DTO intentionally uses this spelling.
  assigmentId: number
  imageKeys: string[]
  specificItems: ReturnSpecificItemRequest[]
  genericItems: ReturnGenericItemRequest[]
}

export interface MultipartAttachment {
  key: string
  file: File
}

export interface MultipartOperation<TRequest> {
  request: TRequest
  attachments: MultipartAttachment[]
}

export function buildOperationFormData<TRequest>({
  request,
  attachments,
}: MultipartOperation<TRequest>): FormData {
  const formData = new FormData()
  formData.append(
    "request",
    new Blob([JSON.stringify(request)], { type: "application/json" })
  )
  attachments.forEach(({ key, file }) => formData.append(key, file))
  return formData
}

export const operationsApi = createApi({
  reducerPath: "operationsApi",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    registerEntry: builder.mutation<
      void,
      RegisterTelecommunicationsItemsRequest
    >({
      query: (body) => ({
        url: `${OPERATION_BASE_URL}/register`,
        method: "POST",
        body,
      }),
    }),
    registerExit: builder.mutation<void, ExitTelecommunicationsItemsRequest>({
      query: (body) => ({
        url: `${OPERATION_BASE_URL}/exit`,
        method: "POST",
        body,
      }),
    }),
    registerAssignment: builder.mutation<
      void,
      MultipartOperation<AssignmentCreateRequest>
    >({
      query: (operation) => ({
        url: `${OPERATION_BASE_URL}/assignment`,
        method: "POST",
        body: buildOperationFormData(operation),
        timeout: 120_000,
      }),
    }),
    registerReturn: builder.mutation<
      void,
      MultipartOperation<ReturnTelecommunicationsItemsRequest>
    >({
      query: (operation) => ({
        url: `${OPERATION_BASE_URL}/return`,
        method: "POST",
        body: buildOperationFormData(operation),
      }),
    }),
  }),
})

export const {
  useRegisterEntryMutation,
  useRegisterExitMutation,
  useRegisterAssignmentMutation,
  useRegisterReturnMutation,
} = operationsApi
