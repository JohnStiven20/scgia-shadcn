import type { VehicleStatus } from "../enum/vehicle-status";

export type UpdateVehicleRequest = {
  internalCode: string;
  licensePlate: string;
  vin: string;
  initialOdometer?: number | null;
  firstRegistrationDate?: string | null;
  status: VehicleStatus;
  available: boolean;
  currentOdometer?: number | null;
  color?: string | null;
  notes?: string | null;
  modelId: number;
  workerId?: number | null;
  warehouseId?: number | null;
};
