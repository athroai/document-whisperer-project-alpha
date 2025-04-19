
export interface AthroCharacter {
  id: string;
  name: string;
  subject: string;
  shortDescription: string;
  fullDescription: string;
  avatarUrl: string;
  tone: string;
  supportsMathNotation: boolean;
  supportsSpecialCharacters: boolean;
  supportedLanguages: string[];
  examBoards: string[];
  topics: string[];
}
