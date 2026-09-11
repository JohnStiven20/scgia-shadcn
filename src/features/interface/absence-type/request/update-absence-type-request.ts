export type UpdateAbsenceTypeRequest = {
  name: string;
  description?: string | null;
  active: boolean;
  allowsHalfDay: boolean;
  maxDays?: number | null;
  calendarColor: string;
};
