import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadedFile } from '@/types/files';
import { File, FileText, FileImage, FileDown } from 'lucide-react';

interface FilesListProps {
  files: UploadedFile[];
  title?: string; // Make title optional
  onFileClick?: (file: UploadedFile) => void;
  onFileDeleted?: () => void;
  isLoading?: boolean;
}

const FilesList: React.FC<FilesListProps> = ({ files, title, onFileClick, onFileDeleted, isLoading }) => {
  const getFileIcon = (file: UploadedFile) => {
    const mimeType = file.mimeType || '';
    
    if (mimeType.includes('pdf')) {
      return <FileDown className="h-5 w-5 text-red-500" />;
    } else if (mimeType.includes('image')) {
      return <FileImage className="h-5 w-5 text-blue-500" />;
    } else if (mimeType.includes('text') || mimeType.includes('document')) {
      return <FileText className="h-5 w-5 text-green-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No files available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {title && <h2 className="text-lg font-medium mb-4">{title}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <Card 
            key={file.id || file.filename} 
            className={`overflow-hidden ${onFileClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
            onClick={() => onFileClick && onFileClick(file)}
          >
            <CardContent className="p-4 flex items-center space-x-3">
              {getFileIcon(file)}
              <div className="overflow-hidden">
                <p className="font-medium truncate">{file.originalName || file.filename}</p>
                <p className="text-sm text-gray-500">{file.subject || file.fileType || 'General'}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FilesList;
