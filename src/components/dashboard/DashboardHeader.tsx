
import React, { useState, useEffect } from 'react';
import { Upload, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { saveMarkingStyle, uploadFile } from '@/services/fileService';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardHeaderProps {
  markingStyle: string;
  setMarkingStyle: (style: string) => void;
  classId?: string;
}

const DashboardHeader = ({ markingStyle, setMarkingStyle, classId = 'default_class' }: DashboardHeaderProps) => {
  const { toast } = useToast();
  const { state } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      // For simplicity, we're only handling one file at a time
      const file = files[0];
      
      // Check file type
      const validFileTypes = ['.pdf', '.doc', '.docx', '.txt'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.'));
      
      if (!validFileTypes.some(type => fileExtension.toLowerCase().includes(type))) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOC, DOCX or TXT file.",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }
      
      // Determine subject based on file name (could be improved)
      let subject = 'mathematics';
      if (file.name.toLowerCase().includes('english')) subject = 'english';
      if (file.name.toLowerCase().includes('science')) subject = 'science';
      if (file.name.toLowerCase().includes('history')) subject = 'history';
      
      // Upload file
      await uploadFile(file, {
        uploadedBy: state.user?.id || 'anonymous',
        role: state.user?.role || 'teacher',
        subject,
        classId,
        visibility: 'class-only',
        type: 'notes' // Default to notes, could be improved with additional UI
      });
      
      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been uploaded and is now available for study sessions.`,
      });
      
      // Reset the input
      event.target.value = '';
      
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleMarkingStyleChange = async (style: string) => {
    try {
      // Update local state
      setMarkingStyle(style);
      
      // Save to Firestore (mock)
      if (state.user?.id) {
        await saveMarkingStyle(
          state.user.id,
          classId,
          style as 'detailed' | 'headline-only' | 'encouraging'
        );
        
        toast({
          title: "Marking style updated",
          description: `Marking style has been set to ${style}.`,
        });
      }
    } catch (error) {
      console.error('Error saving marking style:', error);
      toast({
        title: "Failed to update marking style",
        description: "There was an error saving your preference.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor student progress and manage class resources
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          className="flex items-center gap-2" 
          disabled={isUploading}
        >
          <Upload size={18} />
          <label htmlFor="file-upload" className="cursor-pointer">
            {isUploading ? 'Uploading...' : 'Upload Resources'}
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </Button>
        <div className="flex items-center">
          <Settings size={18} className="mr-2" />
          <div className="space-y-1">
            <Label htmlFor="marking-style">Marking Style</Label>
            <Select value={markingStyle} onValueChange={handleMarkingStyleChange}>
              <SelectTrigger id="marking-style" className="w-[180px]">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="detailed">Detailed</SelectItem>
                <SelectItem value="headline-only">Headline Only</SelectItem>
                <SelectItem value="encouraging">Encouraging</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
