import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FileUp, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, typedSupabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface UploadFilePanelProps {
  onClose?: () => void;
  onUploadComplete?: () => void;
  defaultSubject?: string;
}

const UploadFilePanel: React.FC<UploadFilePanelProps> = ({ 
  onClose, 
  onUploadComplete,
  defaultSubject
}) => {
  const { state } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [subject, setSubject] = useState<string>(defaultSubject || '');
  const [topic, setTopic] = useState<string>('');
  const [visibility, setVisibility] = useState<'private' | 'class-only' | 'public'>('private');
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (!files.length) {
      toast.error("Error", { 
        description: "Please select files to upload." 
      });
      return;
    }

    if (!subject) {
      toast.error("Error", { 
        description: "Please select a subject for your uploads." 
      });
      return;
    }

    if (!state.user) {
      toast.error("Authentication Error", { 
        description: "Please log in to upload files." 
      });
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      const bucketName = state.user.role === 'teacher' ? 
        'teacher_materials' : 
        'student_uploads';
      
      let uploadedCount = 0;
      const totalFiles = files.length;
      
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${subject}/${fileName}`;
        
        const { data: storageData, error: storageError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (storageError) {
          throw new Error(`Storage error: ${storageError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        const uploadData = {
          filename: fileName,
          original_name: file.name,
          storage_path: filePath,
          file_url: publicUrlData?.publicUrl,
          bucket_name: bucketName,
          subject,
          topic: topic || null,
          visibility,
          mime_type: file.type,
          size: file.size,
          file_type: topic || 'general',
          uploaded_by: state.user.id
        };

        const { error: dbError } = await typedSupabase
          .from('uploads')
          .insert(uploadData);

        if (dbError) {
          throw new Error(`Database error: ${dbError.message}`);
        }

        uploadedCount++;
        setProgress(Math.round((uploadedCount / totalFiles) * 90) + 10);
      }

      setProgress(100);

      toast.success("Upload Complete", { 
        description: `Successfully uploaded ${uploadedCount} files` 
      });

      setFiles([]);
      setTopic('');
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';

      if (onUploadComplete) onUploadComplete();
      if (onClose) onClose();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error("Upload Failed", {
        description: error.message
      });
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Upload Study Materials</CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={18} />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
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
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc,.txt"
              multiple
            />
          </div>

          {files.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium mb-1">Selected Files:</p>
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
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="topic">Topic (Optional)</Label>
          <Input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Algebra, Chemical Reactions, Shakespeare"
          />
        </div>

        <div className="space-y-2">
          <Label>Visibility</Label>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                checked={visibility === 'public'}
                onCheckedChange={(checked) => checked ? setVisibility('public') : setVisibility('private')}
                id="public"
              />
              <Label htmlFor="public">Make available to all users</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={visibility === 'class-only'}
                onCheckedChange={(checked) => checked ? setVisibility('class-only') : setVisibility('private')}
                id="class-only"
              />
              <Label htmlFor="class-only">Share with my classes only</Label>
            </div>
          </div>
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
      <CardFooter>
        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          className="w-full"
        >
          {uploading ? "Processing..." : "Upload Files"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UploadFilePanel;
