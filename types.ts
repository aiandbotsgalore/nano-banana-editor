
export interface ImageFile {
  name: string;
  base64: string;
  mimeType: string;
}

export enum AppState {
  START,
  MASKING,
  GENERATING,
  COMPARING,
}
