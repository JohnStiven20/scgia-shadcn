import type { VehicleStatus } from "../enum/vehicle-status";

export type VehicleResponse = {
  id: number;
  internalCode: string;
  licensePlate: string;
  vin: string;
  status: VehicleStatus;
  available: boolean;
  currentOdometer?: number | null;
  modelId: number;
  modelName: string;
  brandId: number;
  brandName: string;
  workerId?: number | null;
  workerName?: string | null;
  workerSurname?: string | null;
  warehouseId?: number | null;
  warehouseName?: string | null;
};
