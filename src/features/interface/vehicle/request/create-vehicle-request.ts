
export type CreateVehicleRequest = {
  internalCode: string;
  licensePlate: string;
  vin: string;
  initialOdometer?: number | null;
  currentOdometer?: number | null;
  firstRegistrationDate?: string | null;
  color?: string | null;
  notes?: string | null;
  modelId: number;
  warehouseId?: number | null;
};