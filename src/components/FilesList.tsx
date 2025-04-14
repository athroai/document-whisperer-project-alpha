import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, FileImage, File as FileIcon, Download, Trash2 } from 'lucide-react';
import fileService, { UploadedFile } from '@/services/fileService';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface FilesListProps {
  files: UploadedFile[];
  title?: string;
  onFileDeleted?: () => void;
  isLoading?: boolean;
}

const FilesList: React.FC<FilesListProps> = ({
  files,
  title = 'Files',
  onFileDeleted,
  isLoading = false
}) => {
  const { toast } = useToast();

  const handleDownload = (file: UploadedFile) => {
    // Create an anchor element and click it to trigger the download
    const link = document.createElement('a');
    link.href = file.fileURL;
    link.download = file.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (file: UploadedFile) => {
    if (!file.id) return;

    try {
      await fileService.deleteFile(file);
      toast({
        title: 'File deleted',
        description: `${file.originalName} has been deleted.`,
      });
      
      // Notify parent component to refresh
      if (onFileDeleted) {
        onFileDeleted();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Delete failed',
        description: 'Failed to delete file. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const renderFileIcon = (file: UploadedFile) => {
    const fileExt = file.originalName.split('.').pop()?.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(fileExt || '')) {
      return <FileImage className="h-8 w-8 text-blue-500" />;
    } else if (['pdf'].includes(fileExt || '')) {
      return <FileIcon className="h-8 w-8 text-red-500" />;
    } else {
      return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  const getFileTypeBadgeColor = (fileType: string) => {
    switch (fileType) {
      case 'paper':
        return 'bg-purple-100 text-purple-800';
      case 'notes':
        return 'bg-blue-100 text-blue-800';
      case 'quiz':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
          </div>
        ) : files.length > 0 ? (
          <div className="space-y-4">
            {files.map((file) => (
              <div 
                key={file.id}
                className="flex items-center border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="mr-4">
                  {renderFileIcon(file)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate" title={file.originalName}>
                      {file.originalName}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownload(file)}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(file)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center mt-1">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${getFileTypeBadgeColor(file.fileType)}`}>
                      {file.fileType.charAt(0).toUpperCase() + file.fileType.slice(1)}
                    </span>
                    {file.subject && (
                      <span className="ml-2 text-xs text-gray-500">
                        {file.subject}
                      </span>
                    )}
                    {file.createdAt && (
                      <span className="ml-auto text-xs text-gray-500">
                        {format(file.createdAt, 'dd MMM yyyy')}
                      </span>
                    )}
                  </div>
                  {file.description && (
                    <p className="mt-1 text-xs text-gray-600 truncate">
                      {file.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p>No files available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FilesList;
