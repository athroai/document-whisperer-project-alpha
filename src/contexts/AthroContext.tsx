
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AthroCharacter, AthroSubject } from '@/types/athro';

export interface AthroContextProps {
  characters: AthroCharacter[];
  activeCharacter: AthroCharacter | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentSubject: string | null;
  setCurrentSubject: (subject: string) => void;
  athroThemeForSubject: (subject: string) => any;
}

const defaultContextValue: AthroContextProps = {
  characters: [],
  activeCharacter: null,
  isOpen: false,
  setIsOpen: () => {},
  currentSubject: null,
  setCurrentSubject: () => {},
  athroThemeForSubject: () => ({}),
};

const AthroContext = createContext<AthroContextProps>(defaultContextValue);

export const useAthro = () => useContext(AthroContext);

export const AthroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<string | null>(null);
  const [characters, setCharacters] = useState<AthroCharacter[]>([
    {
      id: '1',
      subject: 'Mathematics',
      avatar: '/assets/images/athro-math.png',
      description: 'Master geometry, algebra, and calculus with personalized help.',
      greeting: 'Hello! I\'m here to help with your maths questions.',
    },
    {
      id: '2',
      subject: 'Science',
      avatar: '/assets/images/athro-science.png',
      description: 'Explore biology, chemistry, and physics concepts.',
      greeting: 'Hi there! Ready to explore scientific concepts together?',
    },
    {
      id: '3',
      subject: 'English',
      avatar: '/assets/images/athro-english.png',
      description: 'Improve your writing, reading, and literature analysis.',
      greeting: 'Welcome! Let\'s dive into the world of language and literature.',
    },
  ]);

  // Find the active character based on the current subject
  const activeCharacter = currentSubject
    ? characters.find((char) => char.subject === currentSubject) || null
    : null;

  // Get theme colors based on subject
  const athroThemeForSubject = (subject: string) => {
    // Default theme
    const defaultTheme = { 
      primary: 'blue-600',
      secondary: 'green-500',
      primaryHex: '#2563eb',
      secondaryHex: '#22c55e'
    };
    
    const themes: Record<string, {
      primary: string;
      secondary: string;
      primaryHex: string;
      secondaryHex: string;
    }> = {
      'Mathematics': {
        primary: 'blue-600',
        secondary: 'sky-500',
        primaryHex: '#2563eb',
        secondaryHex: '#0ea5e9'
      },
      'Science': {
        primary: 'green-600',
        secondary: 'emerald-500',
        primaryHex: '#16a34a',
        secondaryHex: '#10b981'
      },
      'English': {
        primary: 'purple-600',
        secondary: 'violet-500',
        primaryHex: '#9333ea',
        secondaryHex: '#8b5cf6'
      }
    };
    
    return themes[subject] || defaultTheme;
  };

  return (
    <AthroContext.Provider
      value={{
        characters,
        activeCharacter,
        isOpen,
        setIsOpen,
        currentSubject,
        setCurrentSubject,
        athroThemeForSubject,
      }}
    >
      {children}
    </AthroContext.Provider>
  );
};
