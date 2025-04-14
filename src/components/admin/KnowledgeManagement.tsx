
import React, { useState, useEffect } from 'react';
import { 
  getKnowledgeDocuments, 
  deleteKnowledgeDocument, 
  getDocumentChunks,
  toggleDocumentPublicUsability
} from '@/services/knowledgeBaseService';
import { UploadedDocument, KnowledgeChunk } from '@/types/knowledgeBase';
import KnowledgeUpload from './KnowledgeUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, FileText, EyeOff, Eye, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const KnowledgeManagement: React.FC = () => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<UploadedDocument | null>(null);
  const [documentChunks, setDocumentChunks] = useState<KnowledgeChunk[]>([]);
  const [loadingChunks, setLoadingChunks] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  useEffect(() => {
    // Load all documents on component mount
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const docs = await getKnowledgeDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleViewChunks = async (document: UploadedDocument) => {
    setSelectedDocument(document);
    setLoadingChunks(true);
    
    try {
      const chunks = await getDocumentChunks(document.id);
      setDocumentChunks(chunks);
    } catch (error) {
      console.error('Error loading chunks:', error);
      toast.error('Failed to load document chunks');
    } finally {
      setLoadingChunks(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;
    
    try {
      await deleteKnowledgeDocument(documentToDelete);
      toast.success('Document deleted successfully');
      setDocuments(documents.filter(doc => doc.id !== documentToDelete));
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
      
      // If the deleted document was the selected one, clear it
      if (selectedDocument?.id === documentToDelete) {
        setSelectedDocument(null);
        setDocumentChunks([]);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const confirmDelete = (documentId: string) => {
    setDocumentToDelete(documentId);
    setDeleteDialogOpen(true);
  };

  const handleTogglePublicUsability = async (documentId: string, isPublic: boolean) => {
    try {
      await toggleDocumentPublicUsability(documentId, isPublic);
      
      // Update the documents list with the new status
      const updatedDocs = documents.map(doc => 
        doc.id === documentId ? { ...doc, isPubliclyUsable: isPublic } : doc
      );
      setDocuments(updatedDocs);
      
      // Also update selected document if it's the one being toggled
      if (selectedDocument?.id === documentId) {
        setSelectedDocument({ ...selectedDocument, isPubliclyUsable: isPublic });
      }
      
      toast.success(`Document is now ${isPublic ? 'publicly usable' : 'private'}`);
    } catch (error) {
      console.error('Error toggling document public usability:', error);
      toast.error('Failed to update document visibility');
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderFileTypeBadge = (fileType: string) => {
    let color = '';
    switch (fileType) {
      case 'pdf':
        color = 'bg-red-100 text-red-800';
        break;
      case 'docx':
        color = 'bg-blue-100 text-blue-800';
        break;
      case 'txt':
        color = 'bg-green-100 text-green-800';
        break;
      default:
        color = 'bg-gray-100 text-gray-800';
    }
    return (
      <Badge variant="outline" className={`${color} uppercase`}>
        {fileType}
      </Badge>
    );
  };

  const renderStatusBadge = (status: string) => {
    let color = '';
    let text = status;
    
    switch (status) {
      case 'processing':
        color = 'bg-yellow-100 text-yellow-800';
        text = 'Processing';
        break;
      case 'indexed':
        color = 'bg-green-100 text-green-800';
        text = 'Indexed';
        break;
      case 'failed':
        color = 'bg-red-100 text-red-800';
        text = 'Failed';
        break;
      default:
        color = 'bg-gray-100 text-gray-800';
    }
    
    return (
      <Badge variant="outline" className={`${color}`}>
        {text}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload">
        <TabsList className="mb-4">
          <TabsTrigger value="upload">Upload Knowledge</TabsTrigger>
          <TabsTrigger value="manage">Manage Documents ({documents.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Knowledge Document</CardTitle>
              <CardDescription>
                Add documents to the trusted knowledge base for Athro AI to reference.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <KnowledgeUpload onDocumentUploaded={() => loadDocuments()} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="manage">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Knowledge Documents</CardTitle>
                <CardDescription>
                  View and manage uploaded knowledge documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500">Loading documents...</p>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center">
                    <FileText className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-gray-500">No documents have been uploaded yet</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Use the Upload tab to add documents to the knowledge base
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {documents.map((doc) => (
                        <Card key={doc.id} className={`cursor-pointer ${selectedDocument?.id === doc.id ? 'border-blue-500 ring-1 ring-blue-500' : ''}`} onClick={() => handleViewChunks(doc)}>
                          <CardHeader className="py-3">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-base line-clamp-1">{doc.title}</CardTitle>
                              <div className="flex items-center space-x-1">
                                {renderFileTypeBadge(doc.fileType)}
                                {renderStatusBadge(doc.status)}
                              </div>
                            </div>
                            <CardDescription className="line-clamp-1">
                              {doc.description || 'No description'}
                            </CardDescription>
                          </CardHeader>
                          <CardFooter className="py-3 flex justify-between">
                            <div className="flex flex-col text-xs text-gray-500">
                              <span>Uploaded: {formatDate(doc.timestamp)}</span>
                              <span>Size: {formatBytes(doc.fileSize)}</span>
                              {doc.chunkCount && (
                                <span>Chunks: {doc.chunkCount}</span>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <div className="flex items-center space-x-1">
                                <Switch
                                  checked={doc.isPubliclyUsable}
                                  onCheckedChange={(checked) => handleTogglePublicUsability(doc.id, checked)}
                                />
                                {doc.isPubliclyUsable ? (
                                  <Eye className="h-4 w-4 text-green-500" />
                                ) : (
                                  <EyeOff className="h-4 w-4 text-gray-500" />
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmDelete(doc.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>
                  {selectedDocument ? `Document Details: ${selectedDocument.title}` : 'Document Details'}
                </CardTitle>
                <CardDescription>
                  {selectedDocument
                    ? `${selectedDocument.chunkCount || 0} chunks extracted from this document`
                    : 'Select a document to view its details and chunks'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedDocument ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center">
                    <FileText className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-gray-500">No document selected</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Click on a document from the list to view its details
                    </p>
                  </div>
                ) : loadingChunks ? (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500">Loading chunks...</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Status</p>
                          <p>{renderStatusBadge(selectedDocument.status)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">File Type</p>
                          <p>{renderFileTypeBadge(selectedDocument.fileType)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Publicly Usable</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Switch
                              checked={selectedDocument.isPubliclyUsable}
                              onCheckedChange={(checked) => 
                                handleTogglePublicUsability(selectedDocument.id, checked)
                              }
                            />
                            <span className="text-sm">
                              {selectedDocument.isPubliclyUsable ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Size</p>
                          <p>{formatBytes(selectedDocument.fileSize)}</p>
                        </div>
                      </div>
                      
                      {selectedDocument.subject && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Subject</p>
                          <p>{selectedDocument.subject}</p>
                        </div>
                      )}
                      
                      {selectedDocument.topic && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Topic</p>
                          <p>{selectedDocument.topic}</p>
                        </div>
                      )}
                      
                      {selectedDocument.yearGroup && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Year Group</p>
                          <p>{selectedDocument.yearGroup}</p>
                        </div>
                      )}
                      
                      {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Tags</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedDocument.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Document Chunks</h3>
                      
                      {documentChunks.length === 0 ? (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            No chunks were generated for this document. The document may be empty or processing failed.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Accordion type="single" collapsible className="w-full">
                          {documentChunks.map((chunk, index) => (
                            <AccordionItem key={chunk.id} value={chunk.id}>
                              <AccordionTrigger>
                                Chunk {index + 1} ({chunk.content.slice(0, 30)}...)
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="text-sm whitespace-pre-wrap p-2 bg-gray-50 rounded-md">
                                  {chunk.content}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
              All associated chunks will also be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteDocument}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KnowledgeManagement;
