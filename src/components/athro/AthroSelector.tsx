
import React from 'react';
import { useAthro } from '@/contexts/AthroContext';
import { useStudentClass } from '@/contexts/StudentClassContext';
import { AthroCharacter, AthroSubject } from '@/types/athro';
import AthroCharacterCard from './AthroCharacterCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookOpen } from 'lucide-react';

const AthroSelector: React.FC = () => {
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
          onSelect={setActiveCharacter}
          isActive={activeCharacter?.id === character.id}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Select Your Study Mentor</h2>
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
                  onSelect={setActiveCharacter}
                  isActive={activeCharacter?.id === character.id}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AthroSelector;
