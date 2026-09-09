import type { FuelType } from "../enum/fuel-type";
import type { TransmissionType } from "../enum/transmission-type";

export type VehicleModelResponse = {
  id: number;
  name: string;
  year?: number | null;
  fuelType: FuelType;
  transmissionType: TransmissionType;
  brandId: number;
  brandName: string;
};
