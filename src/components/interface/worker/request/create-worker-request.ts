export type CreateWorkerRequest = {
  name: string;
  surname: string;
  dni: string;
  email: string;
  phone?: string | null;
  active: boolean;
  observations?: string | null;
  employeeCode: string;
  workerTypeId: number;
};


export type SearchWorkersParams = {
    firstName?: string;
    surname?: string;
    dni?: string;
    email?: string;
    phone?: string;
    active?: boolean;
    employeeCode?: string;
    workerTypeId?: number;
    page?: number;
    size?: number;
    sort?: string[];
};
