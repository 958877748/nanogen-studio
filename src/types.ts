
export interface HistoryItem {
  id: string;
  timestamp: number;
  prompt: string;
  resultImage: string; // Base64 data URI
  originalImage?: string; // Base64 data URI (if edit mode)
  type: 'generation' | 'edit';
}

export type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}
