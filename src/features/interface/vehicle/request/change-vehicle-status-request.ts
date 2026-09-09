import type { VehicleStatus } from "../enum/vehicle-status";

export type ChangeVehicleStatusRequest = {
  status: VehicleStatus;
  observation?: string | null;
  performedByAccountUsername: string;
};
