import { createApi } from "@reduxjs/toolkit/query/react"
import { baseQueryWithAuth } from "@/api/rtkBaseQuery"
import type { CancelOwnAbsenceParams } from "@/features/interface/absence-request/request/cancel-own-absence-params"
import type { CreateAbsenceRequest } from "@/features/interface/absence-request/request/create-absence-request"
import type { GetAbsenceRequestsByWorkerParams } from "@/features/interface/absence-request/request/get-absence-requests-by-worker-params"
import type { ReviewAbsenceRequestParams } from "@/features/interface/absence-request/request/review-absence-request-params"
import type { UpdateOwnAbsenceParams } from "@/features/interface/absence-request/request/update-own-absence-params"
import type {
  AbsenceRequestResponse,
  AbsenceRequestsPageResponse,
} from "@/features/interface/absence-request/response/absence-request-response"

const appendAbsenceRequestFormData = (
  formData: FormData,
  request: {
    absenceTypeId: number
    startDate: string
    endDate: string
    observation?: string | null
    files?: File[]
    attachmentIdsToDelete?: number[]
  }
) => {
  const payload = {
    absenceTypeId: request.absenceTypeId,
    startDate: request.startDate,
    endDate: request.endDate,
    observation: request.observation?.trim() || null,
    attachmentIdsToDelete: request.attachmentIdsToDelete,
  }

  formData.append(
    "request",
    new Blob([JSON.stringify(payload)], { type: "application/json" })
  )

  request.files?.forEach((file) => {
    formData.append("files", file)
  })
}

export const absenceRequestApi = createApi({
  reducerPath: "absenceRequestApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["AbsenceRequest"],
  endpoints: (builder) => ({
    getCalendarVisibleAbsenceRequestsByRange: builder.query<
      AbsenceRequestResponse[],
      { from: string; to: string }
    >({
      query: ({ from, to }) => ({
        url: "/absences/calendar",
        method: "GET",
        params: {
          from,
          to,
        },
      }),
      providesTags: ["AbsenceRequest"],
    }),
    getAbsenceRequestsByWorkerId: builder.query<
      AbsenceRequestsPageResponse,
      GetAbsenceRequestsByWorkerParams
    >({
      query: ({ page = 0, size = 10, sort }) => ({
        url: "/absences/worker",
        method: "GET",
        params: {
          page,
          size,
          sort,
        },
      }),
      providesTags: ["AbsenceRequest"],
    }),
    createAbsenceRequest: builder.mutation<void, CreateAbsenceRequest>({
      query: (request) => {
        const formData = new FormData()
        appendAbsenceRequestFormData(formData, request)

        return {
          url: "/absences",
          method: "POST",
          body: formData,
        }
      },
      invalidatesTags: ["AbsenceRequest"],
    }),
    updateOwnAbsenceRequest: builder.mutation<void, UpdateOwnAbsenceParams>({
      query: ({ id, request }) => {
        const formData = new FormData()
        appendAbsenceRequestFormData(formData, request)

        return {
          url: `/absences/my/${id}`,
          method: "PUT",
          body: formData,
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "AbsenceRequest", id },
        "AbsenceRequest",
      ],
    }),
    cancelOwnAbsenceRequest: builder.mutation<void, CancelOwnAbsenceParams>({
      query: ({ id, comment }) => ({
        url: `/absences/my/${id}/cancel`,
        method: "POST",
        body: {
          comment: comment?.trim() || null,
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "AbsenceRequest", id },
        "AbsenceRequest",
      ],
    }),
    approveAbsenceRequest: builder.mutation<void, ReviewAbsenceRequestParams>({
      query: ({ id, reviewComment }) => ({
        url: `/absences/${id}/approve`,
        method: "POST",
        body: {
          reviewComment: reviewComment?.trim() || null,
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "AbsenceRequest", id },
        "AbsenceRequest",
      ],
    }),
    rejectAbsenceRequest: builder.mutation<void, ReviewAbsenceRequestParams>({
      query: ({ id, reviewComment }) => ({
        url: `/absences/${id}/reject`,
        method: "POST",
        body: {
          reviewComment: reviewComment?.trim() || null,
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "AbsenceRequest", id },
        "AbsenceRequest",
      ],
    }),
  }),
})

export const {
  useGetCalendarVisibleAbsenceRequestsByRangeQuery,
  useGetAbsenceRequestsByWorkerIdQuery,
  useCreateAbsenceRequestMutation,
  useUpdateOwnAbsenceRequestMutation,
  useCancelOwnAbsenceRequestMutation,
  useApproveAbsenceRequestMutation,
  useRejectAbsenceRequestMutation,
} = absenceRequestApi
