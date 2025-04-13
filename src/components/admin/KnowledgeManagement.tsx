
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Trash2, FileText, Search } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import KnowledgeUpload from './KnowledgeUpload';
import { getKnowledgeDocuments, deleteKnowledgeDocument, getDocumentChunks } from '@/services/knowledgeBaseService';
import { UploadedDocument, KnowledgeChunk } from '@/types/knowledgeBase';
import { useAuth } from '@/contexts/AuthContext';

const KnowledgeManagement: React.FC = () => {
  const { state } = useAuth();
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDocument, setSelectedDocument] = useState<UploadedDocument | null>(null);
  const [documentChunks, setDocumentChunks] = useState<KnowledgeChunk[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('upload');
  
  // Load documents on component mount
  useEffect(() => {
    if (state.user?.role === 'admin') {
      loadDocuments();
    }
  }, [state.user]);
  
  // Load documents from the service
  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await getKnowledgeDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error("Error loading documents:", error);
      toast({
        title: "Error",
        description: "Failed to load documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // View document chunks
  const handleViewChunks = async (document: UploadedDocument) => {
    setSelectedDocument(document);
    
    try {
      const chunks = await getDocumentChunks(document.id);
      setDocumentChunks(chunks);
      setDialogOpen(true);
    } catch (error) {
      console.error("Error loading chunks:", error);
      toast({
        title: "Error",
        description: "Failed to load document chunks. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Confirm document deletion
  const confirmDelete = (document: UploadedDocument) => {
    setSelectedDocument(document);
    setDeleteDialogOpen(true);
  };
  
  // Delete document
  const handleDelete = async () => {
    if (!selectedDocument) return;
    
    try {
      await deleteKnowledgeDocument(selectedDocument.id);
      setDocuments(documents.filter(doc => doc.id !== selectedDocument.id));
      toast({
        title: "Success",
        description: `Document "${selectedDocument.title}" has been deleted.`,
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedDocument(null);
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };
  
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return <Badge className="bg-yellow-400">Processing</Badge>;
      case 'indexed':
        return <Badge className="bg-green-500">Indexed</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Check if user is admin
  const isAdmin = state.user?.role === 'admin';
  
  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Admin Access Only</h3>
              <p className="text-gray-600">
                The Knowledge Management System is only accessible to administrators.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-[400px] mb-4">
          <TabsTrigger value="upload">Upload Resources</TabsTrigger>
          <TabsTrigger value="manage">Manage Resources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4">
          <KnowledgeUpload />
        </TabsContent>
        
        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Uploaded Knowledge Resources</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={loadDocuments}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading documents...</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No documents have been uploaded yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Chunks</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.title}</TableCell>
                          <TableCell>{doc.subject || 'General'}</TableCell>
                          <TableCell className="uppercase">{doc.fileType}</TableCell>
                          <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                          <TableCell>{formatDate(doc.timestamp)}</TableCell>
                          <TableCell>{renderStatusBadge(doc.status)}</TableCell>
                          <TableCell>{doc.chunkCount || 'N/A'}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewChunks(doc)}
                                disabled={doc.status !== 'indexed'}
                                title="View Chunks"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => confirmDelete(doc)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-100"
                                title="Delete Document"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Document Chunks Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-full max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chunks - {selectedDocument?.title}</DialogTitle>
          </DialogHeader>
          
          {documentChunks.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">No chunks available for this document.</p>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {documentChunks.map((chunk, index) => (
                <Card key={chunk.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-semibold">Chunk {index + 1}</h3>
                      <Badge variant="outline">{chunk.content.split(/\s+/).length} words</Badge>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{chunk.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedDocument?.title}"? This will remove the document and all its indexed content from the knowledge base. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default KnowledgeManagement;
