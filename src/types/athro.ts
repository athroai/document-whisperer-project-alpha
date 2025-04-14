
export type AthroSubject = 'Mathematics' | 'Science' | 'English' | 'History' | 'Geography' | 'Languages';

export interface AthroCharacter {
  id: string;
  subject: string;
  avatar?: string;
  description?: string;
  greeting?: string;
}

export interface AthroTheme {
  primary: string;
  secondary: string;
  primaryHex: string;
  secondaryHex: string;
}

export interface AthroMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  citations?: any[];
}
