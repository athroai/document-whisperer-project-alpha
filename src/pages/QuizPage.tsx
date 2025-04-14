
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { Textarea } from '@/components/ui/textarea';
import { enhanceMessageWithCitations } from '@/services/citationService';
import AthroChat from '@/components/athro/AthroChat';
import { renderWithCitations } from '@/utils/citationUtils';
import FileUpload from '@/components/FileUpload';
import { UploadMetadata } from '@/types/files';
import { CitationSidebar } from '@/components/citations';
import { Citation } from '@/types/citations';

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState('quiz');
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [showReferences, setShowReferences] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [currentSubject, setCurrentSubject] = useState<string>('mathematics');

  // Mock function to simulate AI response with citations
  const generateResponse = async (query: string) => {
    setIsLoading(true);
    try {
      // This is where we'd call our AI service and get a response with citations
      const { enhancedMessage, citations } = await enhanceMessageWithCitations(
        query,
        query,
        currentSubject
      );
      
      setResponse(enhancedMessage);
      setCitations(citations);
      
      if (citations.length > 0) {
        setShowReferences(true);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (metadata: UploadMetadata) => {
    toast({
      title: 'File Uploaded',
      description: `${metadata.filename} has been uploaded and will be available for AI reference.`,
    });
  };

  const handleCitationClick = (citation: Citation) => {
    setSelectedCitation(citation);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      generateResponse(question);
    }
  };

  return (
    <Layout>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">AI Study Assistant</h1>
        
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
            <TabsTrigger value="upload">Upload Study Materials</TabsTrigger>
          </TabsList>
          
          <TabsContent value="quiz" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ask a Question</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Textarea 
                    placeholder="Type your question here..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading || !question.trim()}>
                      {isLoading ? 'Thinking...' : 'Submit'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            {response && (
              <div className="flex">
                <div className={`flex-1 ${showReferences ? 'pr-4' : ''}`}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Response</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        {renderWithCitations(
                          response, 
                          citations, 
                          handleCitationClick
                        )}
                      </div>
                      {citations.length > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowReferences(!showReferences)}
                          className="mt-4"
                        >
                          {showReferences ? 'Hide References' : 'Show References'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                {showReferences && citations.length > 0 && (
                  <div className="w-80 ml-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>References</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {citations.map((citation) => (
                          <div 
                            key={citation.id} 
                            className="p-2 border rounded mb-2 cursor-pointer hover:bg-gray-50"
                            onClick={() => handleCitationClick(citation)}
                          >
                            <p className="font-medium">{citation.label} {citation.filename}</p>
                            {citation.page && <p className="text-sm">Page: {citation.page}</p>}
                            {citation.highlight && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                "{citation.highlight}"
                              </p>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Study Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-600">
                  Upload your study materials to help the AI provide more accurate and relevant answers.
                  Supported file types: PDF, DOCX, TXT.
                </p>
                <FileUpload
                  userId={state.user?.id}
                  userRole={state.user?.role}
                  onFileUploaded={handleFileUpload}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default QuizPage;
