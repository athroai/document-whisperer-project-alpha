
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUp, AlertCircle, Tags, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { uploadKnowledgeDocument } from '@/services/knowledgeBaseService';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface KnowledgeUploadProps {
  onDocumentUploaded?: () => void | Promise<void>;
}

const KnowledgeUpload: React.FC<KnowledgeUploadProps> = ({ onDocumentUploaded }) => {
  const { state } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [yearGroup, setYearGroup] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [isPubliclyUsable, setIsPubliclyUsable] = useState<boolean>(false);
  const [tag, setTag] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
    }
  };

  const handleAddTag = () => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags([...tags, tag.trim()]);
      setTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
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
          tags,
          yearGroup,
          isPubliclyUsable,
          topic,
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
      setTags([]);
      setYearGroup('');
      setTopic('');
      setIsPubliclyUsable(false);
      
      // Reset progress after a short delay
      setTimeout(() => setProgress(0), 2000);
      
      // Call the onDocumentUploaded callback if provided
      if (onDocumentUploaded) {
        await onDocumentUploaded();
      }
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
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
              <Label htmlFor="year-group">Year Group</Label>
              <Select value={yearGroup} onValueChange={setYearGroup}>
                <SelectTrigger id="year-group">
                  <SelectValue placeholder="Select year group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Year</SelectItem>
                  <SelectItem value="year-7">Year 7</SelectItem>
                  <SelectItem value="year-8">Year 8</SelectItem>
                  <SelectItem value="year-9">Year 9</SelectItem>
                  <SelectItem value="year-10">Year 10</SelectItem>
                  <SelectItem value="year-11">Year 11</SelectItem>
                  <SelectItem value="gcse">GCSE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input 
              id="topic" 
              placeholder="Specific topic or area of study" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input 
                id="tags" 
                placeholder="Add tags" 
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                <Tags className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((t) => (
                  <Badge key={t} variant="secondary" className="flex items-center gap-1">
                    {t}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveTag(t)} 
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="public-usable"
              checked={isPubliclyUsable}
              onCheckedChange={setIsPubliclyUsable}
            />
            <Label htmlFor="public-usable">Make Publicly Usable by AI</Label>
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
