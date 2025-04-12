
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadedFile } from '@/types/auth';
import { FileText, BookOpen, HelpCircle } from 'lucide-react';
import { getRecentFiles } from '@/services/fileService';

interface FileReferenceProps {
  userId: string;
  subject: string;
  onFileSelect: (file: UploadedFile) => void;
}

const FileReference: React.FC<FileReferenceProps> = ({ userId, subject, onFileSelect }) => {
  const [relevantFiles, setRelevantFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelevantFiles = async () => {
      try {
        setLoading(true);
        // In production, this would filter by subject
        const files = await getRecentFiles(userId);
        setRelevantFiles(files);
      } catch (error) {
        console.error('Error fetching files:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelevantFiles();
  }, [userId, subject]);

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'paper':
        return <FileText className="h-4 w-4" />;
      case 'notes':
        return <BookOpen className="h-4 w-4" />;
      case 'quiz':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Generate human-friendly reference
  const getAthroReference = (file: UploadedFile) => {
    const type = file.fileType === 'paper' ? 'past paper' : file.fileType;
    const timeReference = new Date(file.timestamp).getTime() > Date.now() - 86400000 * 2 
      ? 'you uploaded recently' 
      : 'from your collection';
    
    if (file.label) {
      return `your ${file.label}`;
    }
    
    return `the ${file.subject} ${type} ${timeReference}`;
  };

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Study Materials</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <p className="text-sm text-center py-2">Loading relevant materials...</p>
        ) : relevantFiles.length === 0 ? (
          <p className="text-sm text-center py-2">No relevant materials found</p>
        ) : (
          <div className="space-y-2">
            {relevantFiles.map(file => (
              <Button 
                key={file.id}
                variant="ghost" 
                className="w-full justify-start text-sm font-normal"
                onClick={() => onFileSelect(file)}
              >
                {getFileIcon(file.fileType)}
                <span className="ml-2 truncate">
                  Would you like to review {getAthroReference(file)}?
                </span>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileReference;
