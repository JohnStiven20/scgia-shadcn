export type StoredFileResponse = {
  id: number;
  originalFileName: string;
  storedFileName: string;
  contentType: string;
  extension?: string | null;
  size?: number | null;
  objectKey?: string | null;
  publicId?: string | null;
  fileUrl: string;
  checksum?: string | null;
  uploadedAt: string;
};
