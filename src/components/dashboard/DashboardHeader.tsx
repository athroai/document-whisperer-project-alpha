
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadCloud, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { saveMarkingStyle, TeacherPreference } from '@/services/fileService';
import { toast } from '@/components/ui/use-toast';
import ResourceUpload from './ResourceUpload';

interface DashboardHeaderProps {
  markingStyle: string;
  setMarkingStyle: (style: "detailed" | "headline-only" | "encouraging") => void;
  classId: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  markingStyle,
  setMarkingStyle,
  classId
}) => {
  const { state } = useAuth();
  const { user } = state;

  // Handle marking style change
  const handleMarkingStyleChange = async (value: string) => {
    const style = value as "detailed" | "headline-only" | "encouraging";
    setMarkingStyle(style);
    
    if (user?.id) {
      try {
        await saveMarkingStyle(user.id, classId, style);
        toast({
          title: "Marking style updated",
          description: `Your marking style preference has been set to ${style}.`,
        });
      } catch (error) {
        console.error('Error saving marking style:', error);
        toast({
          title: "Error saving preference",
          description: "Could not save your marking style preference.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mr-3">
          <User size={20} />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Teacher Dashboard</h1>
          <p className="text-sm text-gray-500">
            {user?.displayName || 'Teacher'} • {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto">
        <div className="w-full md:w-52">
          <Select value={markingStyle} onValueChange={handleMarkingStyleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Marking Style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="detailed">Detailed Marking</SelectItem>
              <SelectItem value="headline-only">Headline Only</SelectItem>
              <SelectItem value="encouraging">Encouraging Style</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <ResourceUpload classId={classId} />
      </div>
    </div>
  );
};

export default DashboardHeader;
