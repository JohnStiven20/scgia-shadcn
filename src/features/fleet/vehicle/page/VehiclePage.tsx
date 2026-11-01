import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  Pencil,
  Trash2,
} from "lucide-react"

import vehicleImage from "@/assets/furgoneta.png"
import { ConfirmDeleteDialog } from "@/components/general"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { useAuthAccess } from "@/features/auth/hooks/useAuthAccess"
import {
  useDeleteVehicleMutation,
  useFindVehicleByIdQuery,
  useUpdateVehicleMutation,
} from "@/features/fleet/api/apiVehicle"
import { VehicleEditDialog } from "@/features/fleet/vehicle/components/VehicleEditDialog"
import { VehicleTabs } from "@/features/fleet/vehicle/components/VehicleTabs"
import { VehicleLicensePlate } from "@/features/fleet/vehicle/components/VehicleLicensePlate"
import type { UpdateVehicleRequest } from "@/features/interface/vehicle/request/update-vehicle-request"
import type { Vehicle } from "@/features/interface/vehicle/type/vehicle-base"

function VehicleBreadcrumb() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link to="/fleet" />}>Flota</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Detalle del vehiculo</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function VehicleDetailsCard({
  canDelete,
  canUpdate,
  vehicle,
  onDelete,
  onEdit,
}: {
  canDelete: boolean
  canUpdate: boolean
  vehicle: Vehicle
  onDelete: () => void
  onEdit: () => void
}) {
  return (
    <article aria-labelledby="vehicle-details-title">
      <Card className="border-border/80 py-3 [--card-spacing:--spacing(3)]">
        <CardHeader className="grid gap-3 border-none pb-0 lg:grid-cols-[9rem_1fr_auto] lg:items-start">
          <AspectRatio
            ratio={4 / 3}
            className="w-full max-w-36 overflow-hidden rounded-md bg-muted"
          >
            <img
              src={vehicleImage}
              alt="Imagen del vehiculo"
              className="absolute inset-0 size-full object-contain"
            />
          </AspectRatio>
          <div className="min-w-0">
            <h2
              id="vehicle-details-title"
              className="text-xl font-bold break-words"
            >
              {vehicle.brandName} {vehicle.modelName}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Código interno: {vehicle.internalCode || "Sin código interno"}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <VehicleLicensePlate value={vehicle.licensePlate} />
              <span className="text-sm font-medium text-slate-700">
                VIN: {vehicle.vin || "Sin dato"}
              </span>
            </div>
          </div>
          {canDelete || canUpdate ? (
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {canDelete ? (
                <Button
                  type="button"
                  variant="outline"
                  className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={onDelete}
                >
                  <Trash2 />
                  Eliminar
                </Button>
              ) : null}
              {canUpdate ? (
                <Button type="button" onClick={onEdit}>
                  <Pencil />
                  Editar
                </Button>
              ) : null}
            </div>
          ) : null}
        </CardHeader>
      </Card>
    </article>
  )
}

export const VehiclePage = () => {
  
  const navigate = useNavigate()
  const { id } = useParams()
  const { hasPermission } = useAuthAccess()
  const canUpdateVehicle = hasPermission("fleet.vehicle.update")
  const canDeleteVehicle = hasPermission("fleet.vehicle.delete")
  const canViewLiveTelemetry = hasPermission("fleet.telemetry.live.view")
  const canViewTelemetryHistory = hasPermission("fleet.telemetry.history.view")
  const canViewExpirations = hasPermission("fleet.expiration.view")
  const canCreateExpiration = hasPermission("fleet.expiration.create")
  const canUpdateExpiration = hasPermission("fleet.expiration.update")
  const canDeleteExpiration = hasPermission("fleet.expiration.delete")
  const canViewSettings = hasPermission("fleet.settings.view")
  const canUpdateSettings = hasPermission("fleet.settings.update")
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const vehicleId = Number(id)
  const isValidVehicleId = Number.isInteger(vehicleId) && vehicleId > 0
  const {
    data: vehicle,
    isLoading,
    isError,
  } = useFindVehicleByIdQuery(vehicleId, {
    skip: !isValidVehicleId,
  })
  const [updateVehicle, { isLoading: isUpdating }] = useUpdateVehicleMutation()
  const [deleteVehicle, { isLoading: isDeleting }] = useDeleteVehicleMutation()

  async function handleUpdateVehicle(request: UpdateVehicleRequest) {
    if (!canUpdateVehicle) return

    await updateVehicle({
      id: vehicleId,
      request,
    }).unwrap()
    setEditDialogOpen(false)
  }

  async function handleDeleteVehicle() {
    if (!canDeleteVehicle) return

    await deleteVehicle({ id: vehicleId }).unwrap()
    navigate("/fleet")
  }

  if (!isValidVehicleId) {
    return (
      <section aria-label="Detalle del vehiculo">
        <p>El identificador del vehiculo no es valido.</p>
      </section>
    )
  }

  if (isLoading) {
    return (
      <section aria-label="Detalle del vehiculo">
        <p>Cargando vehiculo...</p>
      </section>
    )
  }

  if (isError || !vehicle) {
    return (
      <section aria-label="Detalle del vehiculo">
        <p>No se pudo cargar el vehiculo.</p>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-5" aria-label="Detalle del vehiculo">
      <VehicleBreadcrumb />
      <h1 className="text-2xl font-semibold">Detalle del vehiculo</h1>

      <VehicleDetailsCard
        canDelete={canDeleteVehicle}
        canUpdate={canUpdateVehicle}
        vehicle={vehicle}
        onDelete={() => setDeleteDialogOpen(true)}
        onEdit={() => setEditDialogOpen(true)}
      />

      <VehicleTabs
        vehicle={vehicle}
        canCreateExpiration={canCreateExpiration}
        canDeleteExpiration={canDeleteExpiration}
        canUpdateExpiration={canUpdateExpiration}
        canUpdateSettings={canUpdateSettings}
        canViewExpirations={canViewExpirations}
        canViewLiveTelemetry={canViewLiveTelemetry}
        canViewSettings={canViewSettings}
        canViewTelemetryHistory={canViewTelemetryHistory}
      />

      {canUpdateVehicle ? (
        <VehicleEditDialog
          open={editDialogOpen}
          vehicle={vehicle}
          loading={isUpdating}
          onClose={() => setEditDialogOpen(false)}
          onSubmit={handleUpdateVehicle}
        />
      ) : null}

      {canDeleteVehicle ? (
        <ConfirmDeleteDialog
          open={deleteDialogOpen}
          title="Eliminar vehiculo"
          subtitle={`Vas a eliminar el vehiculo ${vehicle.internalCode}.`}
          loading={isDeleting}
          onClose={() => setDeleteDialogOpen(false)}
          onDelete={handleDeleteVehicle}
        />
      ) : null}
    </section>
  )
}
