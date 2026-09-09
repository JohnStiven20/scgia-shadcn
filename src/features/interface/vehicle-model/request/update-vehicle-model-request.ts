import type { FuelType } from "../enum/fuel-type";
import type { TransmissionType } from "../enum/transmission-type";

export type UpdateVehicleModelRequest = {
  name: string;
  commercialName?: string | null;
  year?: number | null;
  vehicleType?: string | null;
  bodyType?: string | null;
  fuelType: FuelType;
  transmissionType: TransmissionType;
  numberOfSeats?: number | null;
  maxAuthorizedMassKg?: number | null;
  curbWeightKg?: number | null;
  payloadCapacityKg?: number | null;
  engineDisplacementCc?: number | null;
  enginePowerKw?: number | null;
  emissionStandard?: string | null;
  brandId: number;
};
