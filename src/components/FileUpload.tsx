import React, { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Upload, File, FileText, X, Check } from 'lucide-react';
import fileService, { UploadedFile } from '@/services/fileService';
import { useAthro } from '@/contexts/AthroContext';
import { UploadMetadata } from '@/types/files';

export interface FileUploadProps {
  userId?: string;
  userRole?: string;
  onFileUploaded?: (file: UploadedFile | UploadMetadata) => void;
  maxSize?: number; // in MB
  allowedTypes?: string[];
}

const FileUpload: React.FC<FileUploadProps> = ({
  userId,
  userRole,
  onFileUploaded,
  maxSize = 10, // Default 10MB
  allowedTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png']
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'paper' | 'notes' | 'quiz'>('notes');
  const [subject, setSubject] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<{ progress: number, status: string, error?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { characters } = useAthro();

  const subjects = characters.map(char => char.subject);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (selectedFile.size > maxSize * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `File size must be less than ${maxSize}MB`,
          variant: 'destructive',
        });
        return;
      }
      
      const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        toast({
          title: 'Invalid file type',
          description: `Allowed file types: ${allowedTypes.join(', ')}`,
          variant: 'destructive',
        });
        return;
      }
      
      setFile(selectedFile);
      
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
      
      setUploadProgress(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setUploadProgress(null);
  };

  const handleUpload = async () => {
    if (!file || !userId) return;
    
    try {
      setUploadProgress({ progress: 0, status: 'uploading' });
      
      const uploadedFile = await fileService.uploadFile(
        file,
        userId,
        {
          fileType,
          subject,
          description
        },
        (progress) => {
          setUploadProgress(progress);
        }
      );
      
      toast({
        title: 'Upload successful',
        description: 'Your file has been uploaded successfully',
      });
      
      handleRemoveFile();
      setFileType('notes');
      setSubject('');
      setDescription('');
      
      if (onFileUploaded) {
        const compatibleFile: UploadMetadata & UploadedFile = {
          id: uploadedFile.id || '',
          url: uploadedFile.fileURL || uploadedFile.url || '',
          mimeType: file.type,
          uploadedBy: userId,
          filename: uploadedFile.filename,
          fileURL: uploadedFile.fileURL || uploadedFile.url || '',
          subject: uploadedFile.subject || subject,
          fileType: uploadedFile.fileType || fileType,
          visibility: 'private',
          storagePath: uploadedFile.filename,
          timestamp: new Date().toISOString(),
          originalName: uploadedFile.originalName || file.name,
          userId: userId
        };
        
        onFileUploaded(compatibleFile);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress({
        progress: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to upload file'
      });
      
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: 'destructive',
      });
    }
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="h-8 w-8 text-gray-400" />;
    
    if (file.type.startsWith('image/')) {
      return preview ? (
        <div className="relative w-16 h-16 overflow-hidden rounded-md">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <File className="h-8 w-8 text-gray-400" />
      );
    }
    
    return <FileText className="h-8 w-8 text-gray-400" />;
  };

  if (!userId) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center py-4">
            <p className="text-gray-500">Please log in to upload files</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Upload className="mr-2 h-5 w-5" />
          Upload Study Material
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          className={`
            border-2 border-dashed rounded-md p-6 text-center cursor-pointer
            ${file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'}
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept={allowedTypes.join(',')}
          />
          
          <div className="flex flex-col items-center justify-center space-y-2">
            {getFileIcon()}
            
            {file ? (
              <>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                >
                  <X className="mr-1 h-3 w-3" />
                  Remove
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-900">Click to select file</p>
                <p className="text-xs text-gray-500">
                  Supported formats: PDF, DOC, PPT, XLS, JPG, PNG
                </p>
                <p className="text-xs text-gray-500">
                  Max file size: {maxSize}MB
                </p>
              </>
            )}
          </div>
        </div>
        
        {uploadProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {uploadProgress.status === 'uploading' 
                  ? 'Uploading...' 
                  : uploadProgress.status === 'success'
                    ? 'Upload complete'
                    : 'Upload failed'
                }
              </span>
              <span>{Math.round(uploadProgress.progress)}%</span>
            </div>
            <Progress value={uploadProgress.progress} className="h-1" />
            
            {uploadProgress.error && (
              <p className="text-xs text-red-500 mt-1">{uploadProgress.error}</p>
            )}
            
            {uploadProgress.status === 'success' && (
              <div className="flex items-center text-xs text-green-600">
                <Check className="mr-1 h-3 w-3" />
                <span>Successfully uploaded</span>
              </div>
            )}
          </div>
        )}
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fileType">File Type</Label>
              <Select 
                value={fileType} 
                onValueChange={(value) => setFileType(value as 'paper' | 'notes' | 'quiz')}
              >
                <SelectTrigger id="fileType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paper">Past Paper</SelectItem>
                  <SelectItem value="notes">Notes</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select 
                value={subject} 
                onValueChange={setSubject}
              >
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subj => (
                    <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea 
              id="description"
              placeholder="Add a brief description of this file"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleUpload} 
          disabled={!file || uploadProgress?.status === 'uploading'}
          className="w-full"
        >
          {uploadProgress?.status === 'uploading' ? (
            <>Uploading...</>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FileUpload;
