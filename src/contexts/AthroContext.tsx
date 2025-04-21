
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AthroCharacter } from '@/types/athro';
import { useAthroCharacters } from '@/hooks/useAthroCharacters';
import { athroCharacters as defaultCharacters } from '@/config/athrosConfig';

interface AthroContextType {
  characters: AthroCharacter[];
  selectedCharacter: AthroCharacter | null;
  setSelectedCharacter: (character: AthroCharacter | null) => void;
  isLoading: boolean;
  getCharacterById: (id: string) => AthroCharacter | null;
  getCharacterBySubject: (subject: string) => AthroCharacter | null;
}

const AthroContext = createContext<AthroContextType>({
  characters: [],
  selectedCharacter: null,
  setSelectedCharacter: () => {},
  isLoading: true,
  getCharacterById: () => null,
  getCharacterBySubject: () => null,
});

export const useAthro = () => useContext(AthroContext);

export const AthroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Convert default characters to ensure they match the AthroCharacter type
  const convertedDefaultChars = defaultCharacters.map(char => ({
    ...char,
    examBoards: char.examBoards as unknown as AthroCharacter['examBoards']
  }));

  const { characters: fetchedCharacters, isLoading } = useAthroCharacters();
  const [characters, setCharacters] = useState<AthroCharacter[]>(convertedDefaultChars);
  const [selectedCharacter, setSelectedCharacter] = useState<AthroCharacter | null>(null);

  useEffect(() => {
    if (fetchedCharacters.length > 0 && !isLoading) {
      setCharacters(fetchedCharacters);
      
      // If no character is selected, set the first one as default
      if (!selectedCharacter) {
        setSelectedCharacter(fetchedCharacters[0]);
      }
    }
  }, [fetchedCharacters, isLoading, selectedCharacter]);

  const getCharacterById = (id: string): AthroCharacter | null => {
    return characters.find(character => character.id === id) || null;
  };

  const getCharacterBySubject = (subject: string): AthroCharacter | null => {
    const lowercaseSubject = subject.toLowerCase();
    return characters.find(character => character.subject.toLowerCase() === lowercaseSubject) || null;
  };

  return (
    <AthroContext.Provider
      value={{
        characters,
        selectedCharacter,
        setSelectedCharacter,
        isLoading,
        getCharacterById,
        getCharacterBySubject,
      }}
    >
      {children}
    </AthroContext.Provider>
  );
};
