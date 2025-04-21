
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AthroCharacter, ExamBoard } from '@/types/athro';

export const useAthroCharacters = () => {
  const [characters, setCharacters] = useState<AthroCharacter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('athro_characters')
          .select('*');

        if (error) {
          throw new Error(error.message);
        }

        // Convert examBoards fields from API to correct type, if needed
        setCharacters((data || []).map((char: any) => ({
          ...char,
          examBoards: (char.examBoards || []).map((eb: string) => eb.toUpperCase()) as ExamBoard[]
        })));
      } catch (err) {
        console.error('Error fetching Athro characters:', err);
        setError(err instanceof Error ? err : new Error('Unknown error fetching characters'));
        
        // Use fallback characters if there's an error
        setCharacters([
          {
            id: 'maths',
            name: 'AthroMaths',
            subject: 'Mathematics',
            shortDescription: 'Your mathematics tutor',
            fullDescription: 'I can help with all areas of GCSE mathematics, from algebra to statistics.',
            avatarUrl: '/avatars/athro-maths.png',
            tone: 'Clear and methodical',
            supportsMathNotation: true,
            supportsSpecialCharacters: false,
            supportedLanguages: ['en'],
            examBoards: ['AQA', 'EDEXCEL'], // FIX
            topics: ['Algebra', 'Geometry', 'Statistics', 'Number']
          },
          {
            id: 'science',
            name: 'AthroScience',
            subject: 'Science',
            shortDescription: 'Your science tutor',
            fullDescription: 'I can help with physics, chemistry and biology at GCSE level.',
            avatarUrl: '/avatars/athro-science.png',
            tone: 'Curious and explanatory',
            supportsMathNotation: true,
            supportsSpecialCharacters: true,
            supportedLanguages: ['en'],
            examBoards: ['AQA', 'EDEXCEL', 'OCR'], // FIX
            topics: ['Biology', 'Chemistry', 'Physics']
          },
          {
            id: 'english',
            name: 'AthroEnglish',
            subject: 'English',
            shortDescription: 'Your English tutor',
            fullDescription: 'I can help with both English Language and English Literature at GCSE level.',
            avatarUrl: '/avatars/athro-english.png',
            tone: 'Articulate and encouraging',
            supportsMathNotation: false,
            supportsSpecialCharacters: false,
            supportedLanguages: ['en'],
            examBoards: ['AQA', 'EDEXCEL', 'OCR'], // FIX
            topics: ['Language', 'Literature', 'Poetry', 'Shakespeare']
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  return { characters, isLoading, error };
};
