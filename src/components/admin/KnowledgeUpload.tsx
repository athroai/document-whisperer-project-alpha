
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUp, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { uploadKnowledgeDocument } from '@/services/knowledgeBaseService';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';

const KnowledgeUpload: React.FC = () => {
  const { state } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!state.user || state.user.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can upload knowledge resources.",
        variant: "destructive",
      });
      return;
    }

    if (files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please provide a title for the document.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setProgress(0);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update progress for UI feedback
        setProgress((i / files.length) * 100);
        
        const fileType = file.name.split('.').pop()?.toLowerCase();
        if (!fileType || !['pdf', 'docx', 'txt'].includes(fileType)) {
          toast({
            title: "Invalid File Type",
            description: `${file.name} is not a supported file type. Only PDF, DOCX, and TXT files are supported.`,
            variant: "destructive",
          });
          continue;
        }
        
        await uploadKnowledgeDocument({
          file,
          title: files.length === 1 ? title : `${title} - ${file.name}`,
          description,
          subject,
          uploadedBy: state.user.id,
        }, (progress) => {
          setProgress(progress);
        });
        
        toast({
          title: "Upload Successful",
          description: `${file.name} has been uploaded and is being processed.`,
        });
      }
      
      // Reset form after successful upload
      setFiles([]);
      setTitle('');
      setDescription('');
      setProgress(100);
      
      // Reset progress after a short delay
      setTimeout(() => setProgress(0), 2000);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Knowledge Resources</CardTitle>
      </CardHeader>
      <form onSubmit={handleUpload}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              placeholder="Resource Title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Brief description of the resource content" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject (Optional)</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger id="subject">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Subjects</SelectItem>
                <SelectItem value="mathematics">Mathematics</SelectItem>
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="welsh">Welsh</SelectItem>
                <SelectItem value="languages">Languages</SelectItem>
                <SelectItem value="history">History</SelectItem>
                <SelectItem value="geography">Geography</SelectItem>
                <SelectItem value="religious-education">Religious Education</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file-upload">Select Files</Label>
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
                  <p className="text-xs text-gray-500">PDF, DOCX, or TXT (MAX. 20MB per file)</p>
                </div>
              </Label>
              <Input 
                id="file-upload"
                type="file" 
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.docx,.doc,.txt"
                multiple
              />
            </div>
            
            {files.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Selected Files:</p>
                <ul className="space-y-1">
                  {files.map((file, index) => (
                    <li key={index} className="text-sm text-gray-500 flex items-center">
                      <span className="mr-2">{file.name}</span>
                      <span className="text-xs">({Math.round(file.size / 1024)} KB)</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Processing files...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
          
          {!state.user || state.user.role !== 'admin' ? (
            <div className="bg-yellow-50 p-3 rounded-md flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-700">
                Only administrators can upload documents to the knowledge base. 
                This feature is restricted to authorized personnel.
              </p>
            </div>
          ) : null}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={uploading || files.length === 0 || !title.trim() || !state.user || state.user.role !== 'admin'}
            className="w-full"
          >
            {uploading ? "Processing..." : "Upload Resources"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default KnowledgeUpload;
