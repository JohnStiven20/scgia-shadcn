import type { VehicleDocumentType } from "../enum/vehicle-document-type";

export type UpdateVehicleDocumentRequest = {
  vehicleId: number;
  documentType: VehicleDocumentType;
  title: string;
  issueDate?: string | null;
  expirationDate?: string | null;
  workerId?: number | null;
  active?: boolean | null;
  notes?: string | null;
  storedFileIdsToDelete?: number[];
  files?: File[];
};
