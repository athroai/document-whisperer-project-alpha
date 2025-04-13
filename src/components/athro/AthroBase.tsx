import React, { useState, useEffect } from 'react';
import { useAthro } from '@/contexts/AthroContext';
import { useNavigate } from 'react-router-dom';
import AthroChat from './AthroChat';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { isInStudySession } from '@/utils/studySessionManager';
import ExitConfirmationModal from './ExitConfirmationModal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AthroBaseProps {
  subject: string;
  allowScience?: boolean; // For Science subject
  allowLanguages?: boolean; // For Languages subject
}

const AthroBase: React.FC<AthroBaseProps> = ({ subject, allowScience, allowLanguages }) => {
  const { activeCharacter, setActiveCharacter } = useAthro();
  const navigate = useNavigate();
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize the active character based on subject if not already set
  useEffect(() => {
    // Set loading state
    setIsLoading(true);
    setError(null);
    
    // Initialize component
    const initComponent = async () => {
      try {
        // Logic to initialize the character if needed
        if (activeCharacter?.subject !== subject) {
          console.log(`AthroBase: Initializing ${subject} character`);
          // Initialize character logic would go here
        }
        
        // Simulate a small delay for transition
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
      } catch (error) {
        console.error(`Error initializing ${subject} Athro:`, error);
        setError(`Could not initialize ${subject} Athro. Please try again.`);
        setIsLoading(false);
      }
    };
    
    initComponent();
  }, [subject, setActiveCharacter, activeCharacter]);

  const handleBackClick = () => {
    if (isInStudySession()) {
      // If in a study session, show confirmation dialog
      setIsExitDialogOpen(true);
    } else {
      // Otherwise just navigate back
      navigate('/athro/select');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-2 bg-background border-b">
          <Button variant="ghost" size="sm" className="gap-1" disabled>
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Selector</span>
          </Button>
        </div>
        <div className="flex items-center justify-center flex-grow">
          <div className="text-center p-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <h3 className="mt-4 font-medium">Loading Athro {subject}...</h3>
            <p className="text-sm text-muted-foreground mt-2">Preparing your study mentor</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-2 bg-background border-b">
          <Button variant="ghost" size="sm" className="gap-1" onClick={handleBackClick}>
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Selector</span>
          </Button>
        </div>
        <div className="flex items-center justify-center flex-grow">
          <div className="max-w-md w-full p-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-4 flex justify-center">
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 bg-background border-b">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1"
          onClick={handleBackClick}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Selector</span>
        </Button>
      </div>
      
      <div className="flex-grow overflow-hidden">
        <AthroChat />
      </div>
      
      {/* Exit confirmation dialog */}
      <ExitConfirmationModal 
        isOpen={isExitDialogOpen}
        onOpenChange={setIsExitDialogOpen}
        destination="/study"
      />
    </div>
  );
};

export default AthroBase;
