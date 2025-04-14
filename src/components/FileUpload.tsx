import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUp, File as FileIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { UploadMetadata } from '@/types/files';

interface FileUploadProps {
  userId?: string;
  userRole?: string;
  onFileUploaded?: (metadata: UploadMetadata) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ userId, userRole, onFileUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [visibility, setVisibility] = useState<string>('private');
  const [label, setLabel] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Missing File",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    // For assignment submissions, we don't need subject/fileType
    if (!onFileUploaded && (!subject || !fileType)) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Mock upload for now - would connect to Firebase Storage in production
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate upload delay

      // Generate a mock URL for the file
      const mockUrl = `https://storage.example.com/files/${Date.now()}-${file.name}`;
      
      const uploadMetadata: UploadMetadata = {
        url: mockUrl,
        filename: file.name,
        mimeType: file.type,
        uploadedBy: userId || 'unknown',
        subject: subject || undefined,
        uploadTime: new Date().toISOString(),
        visibility: (visibility as 'public' | 'class-only' | 'private') || 'private'
      };
      
      // If this is being used in the assignment submission component
      if (onFileUploaded) {
        onFileUploaded(uploadMetadata);
      } else {
        // Regular file upload to user's collection
        const fileMetadata = {
          id: `file_${Date.now()}`,
          uploadedBy: userId,
          subject,
          fileType,
          visibility,
          filename: file.name,
          storagePath: `files/${userId}/${file.name}`,
          timestamp: new Date().toISOString(),
          label: label || undefined,
          mimeType: file.type,
          url: mockUrl
        };

        // Here we would save fileMetadata to Firebase
        toast({
          title: "File Uploaded",
          description: `${file.name} has been successfully uploaded and will be processed for AI knowledge.`,
        });
        
        // In a real implementation, we would call a function to process the file for the knowledge base
        console.log("Processing file for knowledge base:", fileMetadata);
      }

      // Reset form
      setFile(null);
      setLabel('');
      
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your file.",
        variant: "destructive",
      });
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  // Simplified version when used just for file uploads in assignments
  if (onFileUploaded) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <Label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            {file ? (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileIcon className="w-8 h-8 mb-2 text-gray-500" />
                <p className="text-sm text-gray-500">{file.name}</p>
                <p className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileUp className="w-8 h-8 mb-2 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF, DOCX, or images (MAX. 10MB)</p>
              </div>
            )}
          </Label>
          <Input 
            id="file-upload"
            type="file" 
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
          />
        </div>
        <Button 
          onClick={handleUpload} 
          className="w-full"
          disabled={!file || uploading}
        >
          {uploading ? "Uploading..." : "Upload File"}
        </Button>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Upload Study Material</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file-upload">Select File</Label>
          <div className="flex items-center justify-center w-full">
            <Label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              {file ? (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileIcon className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="text-sm text-gray-500">{file.name}</p>
                  <p className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileUp className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF, DOCX, or images (MAX. 10MB)</p>
                </div>
              )}
            </Label>
            <Input 
              id="file-upload"
              type="file" 
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger id="subject">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mathematics">Mathematics</SelectItem>
              <SelectItem value="science">Science</SelectItem>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="history">History</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fileType">File Type</Label>
          <Select value={fileType} onValueChange={setFileType}>
            <SelectTrigger id="fileType">
              <SelectValue placeholder="Select file type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paper">Past Paper</SelectItem>
              <SelectItem value="notes">Notes</SelectItem>
              <SelectItem value="quiz">Quiz</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="visibility">Visibility</Label>
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger id="visibility">
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">Private (Only me)</SelectItem>
              {userRole === 'teacher' && (
                <SelectItem value="public">Public (All students)</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="label">Label (Optional)</Label>
          <Input 
            id="label" 
            placeholder="e.g. Algebra notes, Paper 2 practice" 
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleUpload} 
          className="w-full"
          disabled={!file || !subject || !fileType || uploading}
        >
          {uploading ? "Uploading..." : "Upload File"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FileUpload;
