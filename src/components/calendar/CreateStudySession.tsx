import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSubjects } from '@/hooks/useSubjects';
import { CalendarEvent } from '@/types/calendar';
import TimeSelector from './TimeSelector';
import { useStudySessionForm } from '@/hooks/calendar/useStudySessionForm';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import StudySessionDialog from './StudySessionDialog';

interface CreateStudySessionProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
  onSuccess?: (event: CalendarEvent) => void;
  existingEvents?: CalendarEvent[];
}

const CreateStudySession: React.FC<CreateStudySessionProps> = ({
  isOpen,
  onClose,
  initialDate = new Date(),
  onSuccess,
  existingEvents = []
}) => {
  const { subjects } = useSubjects();
  const { state: authState } = useAuth();
  const { toast } = useToast();
  const {
    formState,
    setTitle,
    setSubject,
    setTopic,
    setDate,
    setStartTime,
    setDuration,
    handleSubmit
  } = useStudySessionForm(initialDate, onClose, onSuccess);

  // Check for authentication
  if (!authState.user) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <p className="mb-4">You need to be logged in to create study sessions.</p>
            <Button asChild>
              <Link to="/login">Log In</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const onSubmit = async () => {
    try {
      await handleSubmit();
      if (onSuccess && formState) {
        // onSuccess will be called inside handleSubmit
      }
    } catch (error) {
      console.error('Failed to create study session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create the study session. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <StudySessionDialog
          open={isOpen}
          onOpenChange={(open) => !open && onClose()}
          selectedDate={initialDate}
          onSuccess={onSuccess}
          existingEvents={existingEvents}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateStudySession;
