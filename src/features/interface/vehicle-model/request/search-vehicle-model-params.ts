import type { FuelType } from "../enum/fuel-type";
import type { TransmissionType } from "../enum/transmission-type";

export type SearchVehicleModelParams = {
  name?: string;
  year?: number;
  fuelType?: FuelType;
  transmissionType?: TransmissionType;
  brandId?: number;
  page?: number;
  size?: number;
  sort?: string[];
};
