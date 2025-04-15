
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { File as FileIcon, Download, FileText, BookOpen, HelpCircle } from 'lucide-react';
import { UploadedFile } from '@/types/auth';

interface FilesListProps {
  files: UploadedFile[];
  title?: string;
}

const FilesList: React.FC<FilesListProps> = ({ files, title = "Your Files" }) => {
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'paper':
        return <FileText className="h-6 w-6" />;
      case 'notes':
        return <BookOpen className="h-6 w-6" />;
      case 'quiz':
        return <HelpCircle className="h-6 w-6" />;
      default:
        return <FileIcon className="h-6 w-6" />;
    }
  };

  const getFileTypeLabel = (fileType: string) => {
    switch (fileType) {
      case 'paper':
        return 'Past Paper';
      case 'notes':
        return 'Notes';
      case 'quiz':
        return 'Quiz';
      default:
        return fileType;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No files found</p>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div 
                key={file.id}
                className="p-3 border rounded-lg flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-md">
                    {getFileIcon(file.fileType)}
                  </div>
                  <div>
                    <h3 className="font-medium">{file.label || file.filename}</h3>
                    <div className="flex text-xs text-gray-500 space-x-2">
                      <span>{getFileTypeLabel(file.fileType)}</span>
                      <span>•</span>
                      <span>{formatDate(file.timestamp)}</span>
                      <span>•</span>
                      <span className="capitalize">{file.subject}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FilesList;
