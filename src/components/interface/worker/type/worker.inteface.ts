export interface Worker {
    id: number;
    name: string;
    surname: string;
    dni: string;
    email: string;
    phone: string;
    active: boolean;
    observations: string | null;
    employeeCode: string;
    accountId: number | null;
    accountUsername: string | null;
    workerTypeId: number;
    workerTypeName: string;
    createdDate: string;
    updatedDate: string;
}
