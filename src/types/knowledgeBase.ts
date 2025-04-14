
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
  tags?: string[];
  yearGroup?: string;
  isPubliclyUsable: boolean;
  topic?: string;
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
  tags?: string[];
  uploadedBy: string;
  timestamp: string;
  yearGroup?: string;
  isPubliclyUsable: boolean;
  topic?: string;
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
  title?: string;
  section?: string;
  page?: number;
  highlight?: string;
  fileUrl?: string;
}

export interface VectorSearchOptions {
  maxResults?: number;
  minSimilarity?: number;
  filterSubject?: string;
  filterTopic?: string;
  filterYearGroup?: string;
  filterTags?: string[];
}

export interface VectorSearchStats {
  queryTime: number;
  resultsCount: number;
  totalChunksScanned: number;
}
