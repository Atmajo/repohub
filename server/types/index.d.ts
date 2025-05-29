export interface GeminiTextType {
  text: string;
}

export interface GeminiFileType {
  path: string;
  mimeType: string;
}

export interface GeminiResponseType {
  text?: string;
  error?: string;
  success: boolean;
}
