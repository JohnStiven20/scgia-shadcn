export type UpdateOwnAbsenceRequest = {
  absenceTypeId: number;
  startDate: string;
  endDate: string;
  observation?: string | null;
  attachmentIdsToDelete?: number[];
  files?: File[];
};
