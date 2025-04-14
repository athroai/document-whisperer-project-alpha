
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { FileUp, Book } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { uploadKnowledgeDocument } from '@/services/knowledgeBaseService';
import { useAuth } from '@/contexts/AuthContext';
import { Switch } from '@/components/ui/switch';
import UploadList from './UploadList';

const KnowledgeUploader: React.FC = () => {
  const { state } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showUploads, setShowUploads] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select files to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please provide a title for your document.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const file = files[0]; // Start with the first file
      
      // Upload the document with progress tracking
      const document = await uploadKnowledgeDocument({
        file,
        title: title || file.name,
        description,
        subject,
        uploadedBy: state.user?.id || 'anonymous',
        isPubliclyUsable: isPublic,
        topic
      }, (progress) => {
        setProgress(progress);
      });
      
      toast({
        title: "Document Uploaded",
        description: "Your document has been uploaded and is being processed for AI reference.",
      });
      
      // Reset form
      setFiles([]);
      setTitle('');
      setDescription('');
      setProgress(0);
      
      // Show the upload list after successful upload
      setShowUploads(true);
      
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload Knowledge Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Select File</Label>
            <div className="flex items-center justify-center w-full">
              <Label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileUp className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF, DOCX, or TXT (MAX. 20MB)</p>
                </div>
              </Label>
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.docx,.doc,.txt"
              />
            </div>
            {files.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium mb-1">Selected File:</p>
                <ul className="text-sm text-gray-600">
                  {files.map((file, index) => (
                    <li key={index} className="flex items-center justify-between py-1">
                      <span>{file.name}</span>
                      <span className="text-xs text-gray-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., GCSE Mathematics Revision Guide"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the document"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <SelectItem value="geography">Geography</SelectItem>
                  <SelectItem value="languages">Languages</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topic (Optional)</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Algebra, Chemical Reactions, Shakespeare"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <Label htmlFor="public">Make available to all users</Label>
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Uploading and processing...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setShowUploads(!showUploads)}
          >
            <Book className="mr-2 h-4 w-4" />
            {showUploads ? "Hide My Uploads" : "View My Uploads"}
          </Button>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading || !title.trim()}
          >
            {uploading ? "Processing..." : "Upload Document"}
          </Button>
        </CardFooter>
      </Card>

      {showUploads && <UploadList userId={state.user?.id} />}
    </div>
  );
};

export default KnowledgeUploader;
