
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadedFile } from '@/types/files';
import { File, FileText, FileImage } from 'lucide-react';

interface FilesListProps {
  files: UploadedFile[];
  onFileClick?: (file: UploadedFile) => void;
}

const FilesList: React.FC<FilesListProps> = ({ files, onFileClick }) => {
  const getFileIcon = (file: UploadedFile) => {
    const mimeType = file.mimeType || '';
    
    if (mimeType.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (mimeType.includes('image')) {
      return <FileImage className="h-5 w-5 text-blue-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  if (files.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No files available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map((file) => (
        <Card 
          key={file.id} 
          className={`overflow-hidden ${onFileClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
          onClick={() => onFileClick && onFileClick(file)}
        >
          <CardContent className="p-4 flex items-center space-x-3">
            {getFileIcon(file)}
            <div className="overflow-hidden">
              <p className="font-medium truncate">{file.originalName || file.filename}</p>
              <p className="text-sm text-gray-500">{file.subject || 'General'}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FilesList;
