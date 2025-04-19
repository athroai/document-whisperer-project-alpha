
import React from 'react';
import { useAthro } from '@/contexts/AthroContext';
import { AthroCharacter } from '@/types/athro';
import AthroCharacterCard from './AthroCharacterCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSubjects } from '@/hooks/useSubjects';

const AthroSelector: React.FC = () => {
  const { characters, activeCharacter, setActiveCharacter } = useAthro();
  const { subjects } = useSubjects();
  
  // Filter characters based on user's subject preferences
  const filteredCharacters = characters.filter(character => 
    subjects.includes(character.subject)
  );

  // Group characters by subject
  const charactersBySubject = filteredCharacters.reduce<Record<string, AthroCharacter[]>>(
    (acc, character) => {
      if (!acc[character.subject]) {
        acc[character.subject] = [];
      }
      acc[character.subject].push(character);
      return acc;
    },
    {} as Record<string, AthroCharacter[]>
  );

  const availableSubjects = Object.keys(charactersBySubject);

  if (filteredCharacters.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <div>
          <p className="text-lg font-medium">No Athro characters available</p>
          <p className="text-sm text-muted-foreground">Select subjects in settings to see study mentors</p>
        </div>
      </div>
    );
  }

  if (availableSubjects.length === 1 && charactersBySubject[availableSubjects[0]].length === 1) {
    // If there's only one character, just show it without tabs
    const character = charactersBySubject[availableSubjects[0]][0];
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
      <Tabs defaultValue={availableSubjects[0]} className="w-full">
        <TabsList className="mb-4 w-full">
          {availableSubjects.map((subject) => (
            <TabsTrigger key={subject} value={subject} className="flex-1">
              {subject}
            </TabsTrigger>
          ))}
        </TabsList>

        {availableSubjects.map((subject) => (
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
