
import React from 'react';
import { Upload, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface DashboardHeaderProps {
  markingStyle: string;
  setMarkingStyle: (style: string) => void;
}

const DashboardHeader = ({ markingStyle, setMarkingStyle }: DashboardHeaderProps) => {
  const { toast } = useToast();
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) have been uploaded successfully.`,
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
        <Button variant="outline" className="flex items-center gap-2">
          <Upload size={18} />
          <label htmlFor="file-upload" className="cursor-pointer">
            Upload Resources
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            className="hidden"
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
          />
        </Button>
        <div className="flex items-center">
          <Settings size={18} className="mr-2" />
          <div className="space-y-1">
            <Label htmlFor="marking-style">Marking Style</Label>
            <Select value={markingStyle} onValueChange={setMarkingStyle}>
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
