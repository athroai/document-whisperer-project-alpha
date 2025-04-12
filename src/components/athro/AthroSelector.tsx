
import React from 'react';
import { useAthro } from '@/contexts/AthroContext';
import { AthroCharacter, AthroSubject } from '@/types/athro';
import AthroCharacterCard from './AthroCharacterCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AthroSelector: React.FC = () => {
  const { characters, activeCharacter, setActiveCharacter } = useAthro();

  // Group characters by subject
  const charactersBySubject = characters.reduce<Record<AthroSubject, AthroCharacter[]>>(
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

  if (characters.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <div>
          <p className="text-lg font-medium">No Athro characters available</p>
          <p className="text-sm text-muted-foreground">Check back soon for new study mentors</p>
        </div>
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
