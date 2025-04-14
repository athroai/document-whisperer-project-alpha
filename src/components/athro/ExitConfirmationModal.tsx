
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { safeExitStudySession } from '@/utils/studySessionManager';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ExitConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  destination?: string;
}

const ExitConfirmationModal: React.FC<ExitConfirmationModalProps> = ({ 
  isOpen, 
  onOpenChange,
  destination = '/study' 
}) => {
  const navigate = useNavigate();
  const { state } = useAuth();
  
  const handleSaveProgress = async () => {
    // In a future implementation, this would save progress to Firestore
    // For now, we'll just show a success message and exit
    if (state.user?.id) {
      await safeExitStudySession(state.user.id);
    }
    onOpenChange(false);
    navigate(destination);
  };
  
  const handleExitAnyway = async () => {
    if (state.user?.id) {
      await safeExitStudySession(state.user.id);
    }
    onOpenChange(false);
    navigate(destination);
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Exit Study Session?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to leave? Unsaved progress may be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button variant="outline" onClick={handleSaveProgress}>
            Save Progress
          </Button>
          <AlertDialogAction onClick={handleExitAnyway}>
            Exit Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ExitConfirmationModal;
