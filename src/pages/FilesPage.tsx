import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FileUpload from '@/components/FileUpload';
import FilesList from '@/components/FilesList';
import { useAuth } from '@/contexts/AuthContext';
import fileService from '@/services/fileService';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { UploadedFile } from '@/types/files';

const FilesPage: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { state } = useAuth();
  const userId = state.user?.id;

  // Fetch files when component mounts or when a file is uploaded/deleted
  const fetchFiles = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const userFiles = await fileService.getUserFiles(userId);
      // Cast the files to the UploadedFile type from types/files.ts
      setFiles(userFiles as unknown as UploadedFile[]);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to load your files. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [userId]);

  // Handle file upload completion
  const handleFileUploaded = () => {
    fetchFiles();
  };

  // Filter files by type
  const paperFiles = files.filter(file => file.fileType === 'paper') as UploadedFile[];
  const notesFiles = files.filter(file => file.fileType === 'notes') as UploadedFile[];
  const quizFiles = files.filter(file => file.fileType === 'quiz') as UploadedFile[];

  // Loading state
  if (isLoading && files.length === 0) {
    return (
      <div className="container py-12 flex justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-purple-600 mx-auto" />
          <p className="mt-4 text-lg text-gray-600">Loading your files...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && files.length === 0) {
    return (
      <div className="container py-12">
        <Card className="mx-auto max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
              <h2 className="mt-2 text-lg font-medium">Something went wrong</h2>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
              <button 
                onClick={fetchFiles}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Study Materials</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <FileUpload 
            userId={userId} 
            userRole={state.user?.role} 
            onFileUploaded={handleFileUploaded}
          />
        </div>
        
        <div className="md:col-span-2">
          <Tabs defaultValue="all">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all">All Files</TabsTrigger>
              <TabsTrigger value="papers">Past Papers</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <FilesList 
                files={files} 
                title="All Files" 
                onFileDeleted={fetchFiles}
                isLoading={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="papers">
              <FilesList 
                files={paperFiles} 
                title="Past Papers" 
                onFileDeleted={fetchFiles}
              />
            </TabsContent>
            
            <TabsContent value="notes">
              <FilesList 
                files={notesFiles} 
                title="Notes" 
                onFileDeleted={fetchFiles}
              />
            </TabsContent>
            
            <TabsContent value="quizzes">
              <FilesList 
                files={quizFiles} 
                title="Quizzes" 
                onFileDeleted={fetchFiles}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default FilesPage;
