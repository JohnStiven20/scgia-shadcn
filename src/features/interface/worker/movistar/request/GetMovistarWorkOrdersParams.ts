export interface GetMovistarWorkOrdersParams {
  providerId: number
  startDate: string
  endDate: string
  workerId?: number
  taskTypeId?: number
  page?: number
  size?: number
}