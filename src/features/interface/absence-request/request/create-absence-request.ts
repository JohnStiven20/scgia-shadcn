export type CreateAbsenceRequest = {
  absenceTypeId: number;
  startDate: string;
  endDate: string;
  observation?: string | null;
  files?: File[];
};
