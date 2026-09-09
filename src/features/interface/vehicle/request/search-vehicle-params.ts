
export type SearchVehicleParams = {
  internalCode?: string;
  licensePlate?: string;
  vin?: string;
  modelId?: number | null
  workerId?: number;
  available?: boolean;
  page?: number;
  size?: number;
  sort?: string[];
};
