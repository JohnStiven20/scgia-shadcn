import type {
  ImageResponse,
  TelecommunicationSpecificItemHistoryEvent,
  TelecommunicationSpecificItemHistoryResponse,
} from "@/features/interface/products/telecommunicationSpecificItemHistory"

export function extractUnitCode(rawCode: string) {
  return rawCode.trim().slice(-12)
}

function getEventTime(event: TelecommunicationSpecificItemHistoryEvent) {
  const time = new Date(event.movementDate).getTime()
  return Number.isNaN(time) ? 0 : time
}

function getLatestEvent(events: TelecommunicationSpecificItemHistoryEvent[]) {
  return events.reduce<TelecommunicationSpecificItemHistoryEvent | null>(
    (latest, event) =>
      !latest || getEventTime(event) > getEventTime(latest) ? event : latest,
    null
  )
}

function getRegisteredEvent(
  events: TelecommunicationSpecificItemHistoryEvent[]
) {
  return events
    .filter((event) => event.movementType === "ENTRY")
    .reduce<TelecommunicationSpecificItemHistoryEvent | null>(
      (earliest, event) =>
        !earliest || getEventTime(event) < getEventTime(earliest)
          ? event
          : earliest,
      null
    )
}

function uniqueImages(images: ImageResponse[]) {
  return Array.from(new Map(images.map((image) => [image.id, image])).values())
}

export function deriveProductUnitDetail(
  response: TelecommunicationSpecificItemHistoryResponse
) {
  if (!response.item) return null

  const history = response.history ?? []
  const latestEvent = getLatestEvent(history)
  const registeredEvent = getRegisteredEvent(history) ?? history[0] ?? null

  return {
    item: response.item,
    history,
    latestEvent,
    registeredEvent,
    workerName:
      latestEvent?.toAccountUsername ??
      latestEvent?.fromAccountUsername ??
      null,
    warehouseName: latestEvent?.fromWarehouseName ?? null,
    observation: latestEvent?.remarks ?? null,
    itemImages: uniqueImages(
      history.flatMap((event) => event.itemImages ?? [])
    ),
  }
}
