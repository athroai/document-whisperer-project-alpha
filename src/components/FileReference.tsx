import React from 'react';
import { UploadedFile } from '@/types/files';

interface FileReferenceProps {
  file: UploadedFile;
}

const FileReferenceName = ({ file }: { file: UploadedFile }) => {
  return (
    <div className="flex flex-col">
      <span className="font-medium">{file.label || file.filename || file.original_name}</span>
      <span className="text-xs text-muted-foreground">{file.label || file.subject || 'Unknown subject'}</span>
    </div>
  );
};

const FileReferenceSize = ({ file }: { file: UploadedFile }) => {
  const fileSizeInKB = file.size ? (file.size / 1024).toFixed(2) : 'Unknown';
  return <span className="text-xs text-muted-foreground">{fileSizeInKB} KB</span>;
};

const FileReferenceType = ({ file }: { file: UploadedFile }) => {
  return <span className="text-xs text-muted-foreground">{file.fileType || file.file_type || 'Unknown type'}</span>;
};

export const FileReference = ({ file }: FileReferenceProps) => {
  return (
    <div className="flex items-center space-x-4">
      <FileReferenceName file={file} />
      <FileReferenceSize file={file} />
      <FileReferenceType file={file} />
    </div>
  );
};
