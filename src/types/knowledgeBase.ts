
export interface UploadedDocument {
  id: string;
  title: string;
  description: string;
  uploadedBy: string;
  timestamp: string;
  fileUrl: string;
  subject?: string;
  fileType: 'pdf' | 'docx' | 'txt';
  fileSize: number;
  status: 'processing' | 'indexed' | 'failed';
  chunkCount?: number;
}

export interface KnowledgeChunk {
  id: string;
  content: string;
  embedding: number[];
  sourceDocumentId: string;
  sourceTitle: string;
  subject?: string;
  pageNumber?: number;
  sectionTitle?: string;
  chunkIndex: number;
}

export interface EmbeddingResponse {
  object: string;
  data: {
    object: string;
    embedding: number[];
    index: number;
  }[];
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface KnowledgeSearchResult {
  chunk: KnowledgeChunk;
  similarity: number;
}
