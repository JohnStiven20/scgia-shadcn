export type CreateAbsenceTypeRequest = {
  name: string;
  description?: string | null;
  active: boolean;
  allowsHalfDay: boolean;
  maxDays?: number | null;
  calendarColor: string;
};
