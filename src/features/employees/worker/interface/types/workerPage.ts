import type { WorkerTypeInterface } from "@/features/interface/worker-type/type/worker-type-interface";

export const workerTabs = ["Datos personales", "Contratos", "Documentos", "Ajustes"] as const;

export type WorkerTab = (typeof workerTabs)[number];

export type WorkerAccount = {
  label: string;
  email: string;
  role: string;
  status: string;
};

export type WorkerDetailViewModel = {
  code: string;
  initials: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  dni: string;
  observations: string;
  createdDate: string;
  updatedDate: string;
  account: WorkerAccount | null;
  workerType: WorkerTypeInterface;
};


export type WorkerTrainingDocumentStatus =
  | "Vigente"
  | "Por caducar"
  | "Caducado"
  | "Sin vencimiento";

export type WorkerTrainingDocumentViewModel = {
  id: number;
  title: string;
  workerName: string;
  section: string;
  sectionKey: "ALL" | "FORMACION" | "SEGURIDAD" | "OPERACION" | "UNASSIGNED";
  trainingDate: string;
  trainingDateLabel: string;
  expirationDate: string | null;
  expirationDateLabel: string;
  documentName: string;
  remarks: string;
  active: boolean;
  status: WorkerTrainingDocumentStatus;
  statusCaption: string;
  daysToExpire: number | null;
  documentPath: string;
  mimeType: string | null;
  fileSize: number | null;
  createdDateLabel: string;
  updatedDateLabel: string;
};
