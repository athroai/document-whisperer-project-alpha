
import React from 'react';
import { useAthro } from '@/contexts/AthroContext';
import AthroCharacterCard from '@/components/athro/AthroCharacterCard';
import { useStudentClass } from '@/contexts/StudentClassContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import AthroProfile from '@/components/athro/AthroProfile';

const AthroSelectorPage: React.FC = () => {
  const { characters } = useAthro();
  const { enrolledSubjects, isMockEnrollment } = useStudentClass();
  
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {characters.map((character) => {
              // Check if student is enrolled in this subject
              const isEnrolled = enrolledSubjects.some(
                subject => subject.subject.toLowerCase() === character.subject.toLowerCase()
              );
              
              // Skip if not enrolled
              if (!isEnrolled) return null;
              
              return (
                <AthroCharacterCard 
                  key={character.id}
                  character={character}
                />
              );
            })}
          </div>
        </div>
        
        <div className="md:col-span-1">
          <AthroProfile />
        </div>
      </div>
    </div>
  );
};

export default AthroSelectorPage;
