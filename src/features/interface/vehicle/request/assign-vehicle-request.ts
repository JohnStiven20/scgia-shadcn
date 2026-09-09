export type AssignVehicleRequest = {
  workerId: number;
  odometer?: number | null;
  fuelLevel?: number | null;
  tyreCondition?: string | null;
  bodyCondition?: string | null;
  observation?: string | null;
  performedByAccountUsername: string;
};
