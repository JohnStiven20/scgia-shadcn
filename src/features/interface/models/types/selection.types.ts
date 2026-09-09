export type SelectionModelType = "SPECIFIC" | "GENERIC";

export type SelectionOperationType = "ENTRY" | "EXIT" | "ASSIGNMENT";

export interface TelecommunicationModelSelectionParams {
  providerId: number;
  modelType: SelectionModelType;
  operationType: SelectionOperationType;
}

export interface TelecommunicationModelSelectionResponse {
  id: number;
  name: string;
  availableQuantity?: number;
}

export type ModelIdentifierListResponse = string[];

export interface TelecommunicationItemSelectionResponse {
  id: number;
  uniqueCode: string;
  uniqueCodeType: string;
  identifierId: number;
  identifier: string;
  createdAt: string;
}

export interface SpringPageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface AvailableModelItemsParams {
  modelId: number;
  page: number;
}
