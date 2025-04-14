import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { uploadFile } from '@/services/fileService';
import { UploadMetadata } from '@/types/files';

interface ResourceUploadProps {
  subjectId?: string;
  classId?: string;
  onUploadComplete?: (metadata: UploadMetadata) => void;
}

const ResourceUpload: React.FC<ResourceUploadProps> = ({
  subjectId = '',
  classId = 'default_class',
  onUploadComplete
}) => {
  const { state } = useAuth();
  const { user } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [resourceType, setResourceType] = useState<string>('topic-notes');
  const [visibility, setVisibility] = useState<'public' | 'class-only' | 'private'>('class-only');
  const [subject, setSubject] = useState(subjectId || 'mathematics');

  // Accepted file types
  const acceptedFileTypes = '.pdf,.docx,.doc,.txt';

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setIsDialogOpen(true);
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);

    try {
      // Upload file using fileService
      const uploadMetadata = await uploadFile(selectedFile, {
        uploadedBy: user.id,
        role: user.role,
        subject,
        classId,
        visibility,
        type: resourceType as 'topic-notes' | 'quiz' | 'past-paper' | 'notes'
      });

      toast({
        title: 'File uploaded successfully',
        description: `${selectedFile.name} has been uploaded and will be available for AI reference.`,
      });

      // Close dialog and reset state
      handleDialogClose();
      
      // Call the onUploadComplete callback if provided
      if (onUploadComplete) {
        onUploadComplete(uploadMetadata as UploadMetadata);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedFileTypes}
        style={{ display: 'none' }}
      />
      <Button onClick={handleUploadClick}>
        <Upload className="mr-2 h-4 w-4" />
        Upload Resource
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Teaching Resource</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Selected File</Label>
              <p className="text-sm text-gray-500 mt-1">
                {selectedFile?.name}
              </p>
            </div>
            <div>
              <Label htmlFor="resource-type">Resource Type</Label>
              <Select value={resourceType} onValueChange={setResourceType}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select resource type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="topic-notes">Topic Notes</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="past-paper">Past Paper</SelectItem>
                  <SelectItem value="notes">Other Notes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="history">History</SelectItem>
                  <SelectItem value="geography">Geography</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block">Visibility</Label>
              <RadioGroup 
                value={visibility} 
                onValueChange={(value) => setVisibility(value as 'public' | 'class-only' | 'private')}
                className="flex flex-col space-y-2 mt-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="class-only" id="class-only" />
                  <Label htmlFor="class-only">Class Only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public">Public</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private">Private (Only You)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResourceUpload;
