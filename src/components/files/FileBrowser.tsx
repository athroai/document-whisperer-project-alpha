
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  File, 
  Image, 
  Loader2, 
  Download, 
  Trash2, 
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadedFile } from '@/types/files';

interface FileBrowserProps {
  onSelectFile?: (file: UploadedFile) => void;
  showUploadButton?: boolean;
  onUploadClick?: () => void;
}

const FileBrowser: React.FC<FileBrowserProps> = ({ 
  onSelectFile,
  showUploadButton = true,
  onUploadClick
}) => {
  const { state: { user } } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState<string>('all');
  const [visibility, setVisibility] = useState<string>('all');
  const [tab, setTab] = useState('my-files');

  const fetchFiles = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('uploads')
        .select('*')
        .order('created_at', { ascending: false });

      if (tab === 'my-files') {
        query = query.eq('uploaded_by', user.id);
      } else if (tab === 'shared') {
        query = query.or(`visibility.eq.public,visibility.eq.class-only`);
      }

      if (subject !== 'all') {
        query = query.eq('subject', subject);
      }

      if (visibility !== 'all') {
        query = query.eq('visibility', visibility);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Explicitly cast the data to UploadedFile[] since we've updated our type
      setFiles(data as unknown as UploadedFile[]);
    } catch (err: any) {
      console.error('Error fetching files:', err);
      setError('Failed to load files. Please try again.');
      toast.error('Error loading files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [user, subject, visibility, tab]);

  const handleDownload = async (file: UploadedFile) => {
    try {
      // Get bucket name from file record
      const { data, error } = await supabase.storage
        .from(file.bucket_name || 'uploads')
        .download(file.storage_path || '');
        
      if (error) throw error;
      
      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename || 'download';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.info('File download started');
    } catch (err: any) {
      console.error('Download error:', err);
      toast.error('Download failed');
    }
  };

  const handleDelete = async (file: UploadedFile) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(file.bucket_name || 'uploads')
        .remove([file.storage_path || '']);
        
      if (storageError) throw storageError;
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('uploads')
        .delete()
        .eq('id', file.id || '');
        
      if (dbError) throw dbError;
      
      // Update UI
      setFiles(files.filter(f => f.id !== file.id));
      toast.success('File deleted');
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error('Delete failed');
    }
  };

  const handleVisibilityToggle = async (file: UploadedFile) => {
    try {
      const newVisibility = file.visibility === 'private' ? 'public' : 'private';
      
      const { error } = await supabase
        .from('uploads')
        .update({ visibility: newVisibility })
        .eq('id', file.id || '');
        
      if (error) throw error;
      
      // Update UI
      setFiles(files.map(f => 
        f.id === file.id 
          ? { ...f, visibility: newVisibility } 
          : f
      ));
      
      toast.success(
        `File is now ${newVisibility === 'public' ? 'public' : 'private'}`
      );
    } catch (err: any) {
      console.error('Update error:', err);
      toast.error('Update failed');
    }
  };

  const getFileIcon = (file: UploadedFile) => {
    const mimeType = file.file_type || file.mime_type || '';
    
    if (mimeType.includes('image')) return <Image className="h-8 w-8 text-blue-500" />;
    if (mimeType.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-files">My Files</TabsTrigger>
            <TabsTrigger value="shared">Shared Files</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {showUploadButton && (
          <Button 
            onClick={onUploadClick}
            className="whitespace-nowrap"
          >
            Upload File
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            <SelectItem value="mathematics">Mathematics</SelectItem>
            <SelectItem value="science">Science</SelectItem>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="history">History</SelectItem>
            <SelectItem value="geography">Geography</SelectItem>
          </SelectContent>
        </Select>

        <Select value={visibility} onValueChange={setVisibility}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Visibility</SelectItem>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="class-only">Class Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-600">{error}</div>
      ) : files.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-md text-center">
          <File className="h-12 w-12 mb-2 mx-auto text-gray-400" />
          <h3 className="text-lg font-medium">No files found</h3>
          <p className="text-gray-500">
            {tab === 'my-files' 
              ? 'Upload some files to see them here.'
              : 'No shared files available.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {files.map((file) => (
            <Card key={file.id} className="p-4 flex">
              <div className="flex-shrink-0 mr-4">
                {getFileIcon(file)}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start">
                  <div className="truncate">
                    <h3 className="font-medium truncate">
                      {file.original_name || file.filename}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {file.subject} {file.topic ? `• ${file.topic}` : ''}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {onSelectFile && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onSelectFile(file)}
                    >
                      Select
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDownload(file)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  {tab === 'my-files' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVisibilityToggle(file)}
                      >
                        {file.visibility === 'private' ? (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            Make Public
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-4 w-4 mr-1" />
                            Make Private
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(file)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileBrowser;
