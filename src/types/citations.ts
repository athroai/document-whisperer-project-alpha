
export interface Citation {
  id: string;
  label: string;
  filename: string;
  page?: number;
  section?: string;
  highlight?: string;
  timestamp: string;
  url?: string;
}

export interface CitedMessage {
  content: string;
  citations: Citation[];
}

