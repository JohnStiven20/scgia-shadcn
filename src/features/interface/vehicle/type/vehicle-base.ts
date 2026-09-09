import type { VehicleStatus } from "../enum/vehicle-status";

export type Vehicle = {
  id: number;
  internalCode: string;
  licensePlate: string;
  vin: string;
  status: VehicleStatus;
  available: boolean;
  initialOdometer?: number | null;
  firstRegistrationDate?: string | null;
  currentOdometer?: number | null;
  color?: string | null;
  notes?: string | null;
  modelId: number;
  modelName: string;
  brandId: number;
  brandName: string;
  workerId?: number | null;
  workerName?: string | null;
  workerSurname?: string | null;
  warehouseId?: number | null;
  warehouseName?: string | null;
  telemetryDeviceIdentifier?: string | null;
};
