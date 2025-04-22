
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CalendarEvent } from '@/types/calendar';
import { useAuth } from '@/contexts/AuthContext';
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
  const { state: authState } = useAuth();

  // Check for authentication
  if (!authState.user) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[500px]">
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

  return (
    <StudySessionDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      selectedDate={initialDate}
      onSuccess={onSuccess}
      existingEvents={existingEvents}
    />
  );
};

export default CreateStudySession;
