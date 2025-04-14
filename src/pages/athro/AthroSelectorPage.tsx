
import React, { useState, useEffect } from 'react';
import { useAthro } from '@/contexts/AthroContext';
import AthroCharacterCard from '@/components/athro/AthroCharacterCard';
import { useStudentClass } from '@/contexts/StudentClassContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Loader2 } from 'lucide-react';
import AthroProfile from '@/components/athro/AthroProfile';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import athrosConfig from '@/config/athrosConfig';

const AthroSelectorPage: React.FC = () => {
  const { characters, setActiveCharacter, setCurrentSubject, loading: athroLoading } = useAthro();
  const { enrolledSubjects, isMockEnrollment, loading: classLoading } = useStudentClass();
  const { state } = useAuth();
  const { t } = useTranslation();
  const [isInitializing, setIsInitializing] = useState(true);
  
  useEffect(() => {
    // Initialize with athrosConfig if characters is empty and not still loading
    if (characters.length === 0 && !athroLoading && athrosConfig.length > 0) {
      console.log('Using athrosConfig as fallback for characters');
      setActiveCharacter(athrosConfig[0]);
    } else if (characters.length > 0) {
      console.log(`Loaded ${characters.length} characters from context`);
    }
    
    // Wait for both characters and enrolled subjects to be loaded
    if (!classLoading && !athroLoading) {
      setIsInitializing(false);
    }
  }, [characters, classLoading, athroLoading, setActiveCharacter]);
  
  // If still loading, show a loading indicator
  if (isInitializing || classLoading || athroLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Choose Your Athro</h1>
          <p className="text-muted-foreground">Loading your subjects...</p>
        </div>
        
        <div className="flex flex-col items-center justify-center p-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Preparing your personalized study experience...</p>
        </div>
      </div>
    );
  }
  
  // Use all available subjects from config if no enrollment or for testing
  const availableSubjects = enrolledSubjects.length === 0 
    ? characters
    : characters.filter(character => 
        enrolledSubjects.some(subject => 
          subject.subject.toLowerCase() === character.subject.toLowerCase()
        )
      );

  const handleSelectCharacter = (character) => {
    console.log('Selected character:', character.subject);
    setActiveCharacter(character);
    setCurrentSubject(character.subject);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Choose Your Athro</h1>
        <p className="text-muted-foreground">
          Select a subject to begin studying with your personal Athro mentor
        </p>
      </div>
      
      {isMockEnrollment && (
        <Alert className="mb-6 bg-blue-50 text-blue-800 border-blue-200">
          <Info className="h-4 w-4" />
          <AlertTitle>Mock Enrollment Active</AlertTitle>
          <AlertDescription>
            You're using mock class data for testing purposes. All sessions are simulated.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {availableSubjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableSubjects.map((character) => (
                <AthroCharacterCard 
                  key={character.id}
                  character={character}
                  onSelect={handleSelectCharacter}
                />
              ))}
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-6">
              <h3 className="font-medium text-amber-800 mb-2">No Subjects Available</h3>
              <p className="text-amber-700">
                You aren't currently enrolled in any subjects. Please check with your teacher
                to ensure you're registered for classes.
              </p>
            </div>
          )}
        </div>
        
        <div className="md:col-span-1">
          <AthroProfile />
        </div>
      </div>
      
      {/* Debug information */}
      {import.meta.env.DEV && (
        <div className="mt-8 p-4 border border-dashed rounded-md bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Debug Information:</h3>
          <div className="text-xs text-slate-600 space-y-1">
            <div><strong>User:</strong> {state.user?.email || 'Not logged in'}</div>
            <div><strong>Role:</strong> {state.user?.role || 'Unknown'}</div>
            <div><strong>Available Subjects:</strong> {availableSubjects.length}</div>
            <div><strong>Mock Enrollment:</strong> {isMockEnrollment ? 'Yes' : 'No'}</div>
            <div><strong>Characters Loaded:</strong> {characters?.length || 0}</div>
            <div><strong>DB Characters:</strong> {characters?.length || 0}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AthroSelectorPage;
