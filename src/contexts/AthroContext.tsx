
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AthroCharacter, AthroSubject, AthroTheme } from '@/types/athro';
import athroCharactersService from '@/services/athroCharactersService';
import athroService from '@/services/athroService';
import athrosConfig from '@/config/athrosConfig';

export interface AthroContextProps {
  characters: AthroCharacter[];
  activeCharacter: AthroCharacter | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentSubject: string | null;
  setCurrentSubject: (subject: string) => void;
  setActiveCharacter: (character: AthroCharacter) => void;
  athroThemeForSubject: (subject: string) => AthroTheme;
  currentScienceSubject?: string;
  setCurrentScienceSubject?: (subject: string) => void;
  loading: boolean;
}

const defaultContextValue: AthroContextProps = {
  characters: [],
  activeCharacter: null,
  isOpen: false,
  setIsOpen: () => {},
  currentSubject: null,
  setCurrentSubject: () => {},
  setActiveCharacter: () => {},
  athroThemeForSubject: () => ({
    primary: 'blue-600',
    secondary: 'green-500',
    primaryHex: '#2563eb',
    secondaryHex: '#22c55e'
  }),
  loading: true
};

const AthroContext = createContext<AthroContextProps>(defaultContextValue);

export const useAthro = () => useContext(AthroContext);

export const AthroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<string | null>(null);
  const [currentScienceSubject, setCurrentScienceSubject] = useState<string>('biology');
  const [activeCharacter, setActiveCharacter] = useState<AthroCharacter | null>(null);
  const [characters, setCharacters] = useState<AthroCharacter[]>([]); 
  const [loading, setLoading] = useState(true);

  // Initialize characters from service with fallback to config
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        // First try to get characters from the database
        const dbCharacters = await athroService.getCharacters();
        
        if (dbCharacters && dbCharacters.length > 0) {
          console.log(`Loaded ${dbCharacters.length} characters from database`);
          setCharacters(dbCharacters);
          // If no active character is set, set the first one
          if (!activeCharacter && dbCharacters.length > 0) {
            setActiveCharacter(dbCharacters[0]);
          }
        } else {
          // Fallback to service or config
          const serviceCharacters = athroCharactersService.getCharacters();
          
          // If the service doesn't return characters, use the config as fallback
          if (!serviceCharacters || serviceCharacters.length === 0) {
            console.log('Using athrosConfig as fallback for characters');
            setCharacters(athrosConfig);
            if (athrosConfig.length > 0 && !activeCharacter) {
              setActiveCharacter(athrosConfig[0]);
            }
          } else {
            console.log(`Loaded ${serviceCharacters.length} characters from service`);
            setCharacters(serviceCharacters);
            if (!activeCharacter && serviceCharacters.length > 0) {
              setActiveCharacter(serviceCharacters[0]);
            }
          }
        }
      } catch (error) {
        console.error('Error loading Athro characters:', error);
        // Use config as final fallback
        setCharacters(athrosConfig);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCharacters();
  }, []);

  // Get theme colors based on subject using the service
  const athroThemeForSubject = (subject: string) => {
    const theme = athroCharactersService.getThemeForSubject(subject);
    return theme || {
      primary: 'purple-600',
      secondary: 'blue-500',
      primaryHex: '#9333ea',
      secondaryHex: '#3b82f6'
    };
  };

  return (
    <AthroContext.Provider
      value={{
        characters,
        activeCharacter,
        setActiveCharacter,
        isOpen,
        setIsOpen,
        currentSubject,
        setCurrentSubject,
        athroThemeForSubject,
        currentScienceSubject,
        setCurrentScienceSubject,
        loading
      }}
    >
      {children}
    </AthroContext.Provider>
  );
};
