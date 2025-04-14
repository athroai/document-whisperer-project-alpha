
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Eye, EyeOff, FileText, Trash2 } from 'lucide-react';
import { getKnowledgeDocuments, deleteKnowledgeDocument, toggleDocumentPublicUsability } from '@/services/knowledgeBaseService';
import { UploadedDocument } from '@/types/knowledgeBase';
import { useToast } from '@/components/ui/use-toast';

interface UploadListProps {
  userId?: string;
}

const UploadList: React.FC<UploadListProps> = ({ userId = 'anonymous' }) => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const docs = await getKnowledgeDocuments();
      // Filter documents by user ID if needed
      const filteredDocs = userId ? docs.filter(doc => doc.uploadedBy === userId) : docs;
      setDocuments(filteredDocs);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch documents.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [userId]);

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await deleteKnowledgeDocument(documentId);
      setDocuments(documents.filter(doc => doc.id !== documentId));
      toast({
        title: 'Document Deleted',
        description: 'The document has been removed.',
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the document.',
        variant: 'destructive',
      });
    }
  };

  const handleTogglePublicVisibility = async (documentId: string, isPublic: boolean) => {
    try {
      await toggleDocumentPublicUsability(documentId, isPublic);
      setDocuments(documents.map(doc => 
        doc.id === documentId ? {...doc, isPubliclyUsable: isPublic} : doc
      ));
      toast({
        title: 'Visibility Updated',
        description: `Document is now ${isPublic ? 'publicly available' : 'private'}.`,
      });
    } catch (error) {
      console.error('Error updating document visibility:', error);
      toast({
        title: 'Error',
        description: 'Failed to update document visibility.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Uploaded Documents</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-gray-500">Loading documents...</p>
        ) : documents.length === 0 ? (
          <p className="text-center text-gray-500">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-4">
            {documents.map(doc => (
              <div key={doc.id} className="p-3 border rounded-md">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-blue-500" />
                    <div>
                      <h4 className="font-medium">{doc.title}</h4>
                      <p className="text-sm text-gray-500">
                        {formatDate(doc.timestamp)} · {(doc.fileSize / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Switch
                        id={`public-${doc.id}`}
                        checked={doc.isPubliclyUsable}
                        onCheckedChange={(checked) => handleTogglePublicVisibility(doc.id, checked)}
                      />
                      {doc.isPubliclyUsable ? (
                        <Eye className="h-4 w-4 text-gray-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDeleteDocument(doc.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {doc.subject && (
                    <Badge variant="outline" className="text-xs">
                      {doc.subject}
                    </Badge>
                  )}
                  {doc.topic && (
                    <Badge variant="outline" className="text-xs">
                      {doc.topic}
                    </Badge>
                  )}
                  <Badge variant={doc.status === 'indexed' ? 'success' : 'secondary'} className="text-xs">
                    {doc.status === 'indexed' ? 'Indexed' : doc.status === 'processing' ? 'Processing' : 'Failed'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadList;
