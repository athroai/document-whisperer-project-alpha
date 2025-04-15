
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FileUpload from '@/components/FileUpload';
import FilesList from '@/components/FilesList';
import { UploadedFile } from '@/types/auth';
import { getUserFiles } from '@/services/fileService';

const FilesPage: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock user - In production this would come from auth context
  const mockUser = {
    id: 'user_1',
    role: 'student'
  };

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const userFiles = await getUserFiles(mockUser.id);
        setFiles(userFiles);
      } catch (error) {
        console.error('Error fetching files:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, [mockUser.id]);

  // Filter files by type
  const paperFiles = files.filter(file => file.fileType === 'paper');
  const notesFiles = files.filter(file => file.fileType === 'notes');
  const quizFiles = files.filter(file => file.fileType === 'quiz');

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Study Materials</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <FileUpload userId={mockUser.id} userRole={mockUser.role} />
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
              {isLoading ? (
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center">Loading files...</p>
                  </CardContent>
                </Card>
              ) : (
                <FilesList files={files} title="All Files" />
              )}
            </TabsContent>
            
            <TabsContent value="papers">
              <FilesList files={paperFiles} title="Past Papers" />
            </TabsContent>
            
            <TabsContent value="notes">
              <FilesList files={notesFiles} title="Notes" />
            </TabsContent>
            
            <TabsContent value="quizzes">
              <FilesList files={quizFiles} title="Quizzes" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default FilesPage;
