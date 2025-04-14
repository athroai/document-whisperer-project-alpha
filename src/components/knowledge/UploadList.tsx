
import React from 'react';
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, FileText, ExternalLink } from "lucide-react";
import { UploadedDocument } from "@/types/knowledgeBase";
import { Skeleton } from "@/components/ui/skeleton";

interface UploadListProps {
  documents: UploadedDocument[];
  isLoading?: boolean;
  onDelete?: (docId: string) => void;
  onView?: (doc: UploadedDocument) => void;
  userId?: string; // Add userId prop to match usage in KnowledgeUploader
}

const formatFileSize = (sizeInBytes: number): string => {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  } else if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  }
};

const formatDate = (timestamp: number | Date | string): string => {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const getStatusBadge = (status: string) => {
  switch(status.toLowerCase()) {
    case 'processing':
      return <Badge variant="outline">Processing</Badge>;
    case 'ready':
      return <Badge>Ready</Badge>;
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>;
    case 'indexing':
      return <Badge variant="secondary">Indexing</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getSubjectBadge = (subject?: string) => {
  if (!subject) return null;
  
  // Using valid variant values from the Badge component
  return <Badge variant="outline">{subject}</Badge>;
};

const UploadItem = ({ 
  document, 
  onDelete,
  onView 
}: { 
  document: UploadedDocument, 
  onDelete?: (docId: string) => void,
  onView?: (doc: UploadedDocument) => void
}) => {
  return (
    <div className="p-4 border rounded-md mb-3 bg-white shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="font-medium">{document.title}</h3>
        </div>
        <div className="flex space-x-2">
          {getStatusBadge(document.status || 'ready')}
        </div>
      </div>
      
      <div className="text-sm text-gray-500 mb-3">
        {document.description && (
          <p className="mb-1">{document.description}</p>
        )}
        <div className="flex items-center mt-2 space-x-2">
          <span>Uploaded: {formatDate(document.timestamp)}</span>
          {document.subject && getSubjectBadge(document.subject)}
          {document.topic && <Badge variant="outline">{document.topic}</Badge>}
          {document.fileSize && (
            <span className="text-xs text-gray-400">
              {formatFileSize(document.fileSize)}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 mt-2">
        {onView && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onView(document)}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            View
          </Button>
        )}
        
        {onDelete && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onDelete(document.id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};

const UploadList: React.FC<UploadListProps> = ({ 
  documents, 
  isLoading = false,
  onDelete,
  onView
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-1" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg bg-gray-50">
        <FileText className="h-10 w-10 text-gray-400 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-gray-600 mb-1">No documents yet</h3>
        <p className="text-sm text-gray-500">
          Upload documents to enhance your study experience
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <UploadItem 
          key={doc.id} 
          document={doc}
          onDelete={onDelete}
          onView={onView}
        />
      ))}
    </div>
  );
};

export default UploadList;
