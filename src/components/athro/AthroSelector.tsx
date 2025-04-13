
import React from 'react';
import { useAthro } from '@/contexts/AthroContext';
import { useStudentClass } from '@/contexts/StudentClassContext';
import { AthroCharacter, AthroSubject } from '@/types/athro';
import AthroCharacterCard from './AthroCharacterCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookOpen } from 'lucide-react';

interface AthroSelectorProps {
  onSelectAthro?: (character: AthroCharacter) => void; // Optional custom handler
  mode?: 'standard' | 'self-study'; // Mode affects UI text
}

const AthroSelector: React.FC<AthroSelectorProps> = ({ 
  onSelectAthro,
  mode = 'standard'
}) => {
  const { characters, activeCharacter, setActiveCharacter } = useAthro();
  const { enrolledSubjects, isEnrolledInSubject, loading } = useStudentClass();

  // Filter characters based on student's enrolled subjects
  const filteredCharacters = characters.filter(character => 
    isEnrolledInSubject(character.subject)
  );
  
  // Group characters by subject
  const charactersBySubject = filteredCharacters.reduce<Record<AthroSubject, AthroCharacter[]>>(
    (acc, character) => {
      if (!acc[character.subject]) {
        acc[character.subject] = [];
      }
      acc[character.subject].push(character);
      return acc;
    },
    {} as Record<AthroSubject, AthroCharacter[]>
  );

  const subjects = Object.keys(charactersBySubject) as AthroSubject[];

  const handleSelectCharacter = (character: AthroCharacter) => {
    // If custom handler is provided, use that
    if (onSelectAthro) {
      onSelectAthro(character);
    } else {
      // Default behavior
      setActiveCharacter(character);
    }
  };

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <div>
          <p className="text-lg font-medium">Loading your study mentors...</p>
        </div>
      </div>
    );
  }

  if (filteredCharacters.length === 0) {
    return (
      <div className="space-y-4">
        <Alert>
          <BookOpen className="h-4 w-4" />
          <AlertTitle>No study mentors available</AlertTitle>
          <AlertDescription>
            {enrolledSubjects.length === 0 
              ? "You're not enrolled in any subjects yet. Please join a class to access study mentors."
              : "No study mentors are available for your enrolled subjects at the moment."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (subjects.length === 1 && charactersBySubject[subjects[0]].length === 1) {
    // If there's only one character, just show it without tabs
    const character = charactersBySubject[subjects[0]][0];
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Study Mentor</h2>
        <AthroCharacterCard
          character={character}
          onSelect={handleSelectCharacter}
          isActive={activeCharacter?.id === character.id}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        {mode === 'self-study' 
          ? "Select a Subject to Study" 
          : "Select Your Study Mentor"}
      </h2>
      <Tabs defaultValue={subjects[0]} className="w-full">
        <TabsList className="mb-4 w-full">
          {subjects.map((subject) => (
            <TabsTrigger key={subject} value={subject} className="flex-1">
              {subject}
            </TabsTrigger>
          ))}
        </TabsList>

        {subjects.map((subject) => (
          <TabsContent key={subject} value={subject}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {charactersBySubject[subject].map((character) => (
                <AthroCharacterCard
                  key={character.id}
                  character={character}
                  onSelect={handleSelectCharacter}
                  isActive={activeCharacter?.id === character.id}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      {mode === 'self-study' && (
        <p className="text-sm text-muted-foreground mt-4">
          Self-study sessions help you practice independently. Your progress won't be automatically shared with teachers.
        </p>
      )}
    </div>
  );
};

export default AthroSelector;
