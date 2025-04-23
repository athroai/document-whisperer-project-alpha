
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AthroCharacter, ExamBoard } from '@/types/athro';
import { standardizeAthroCharacter } from '@/utils/athroHelpers';

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

        // Convert examBoards fields from API to correct type
        setCharacters((data || []).map((char: any) => {
          // Ensure examBoards are properly typed as ExamBoard[]
          const examBoards: ExamBoard[] = (char.examBoards || []).map((eb: string) => {
            if (eb === 'Edexcel') return 'Edexcel' as ExamBoard;
            return eb.toUpperCase() as ExamBoard;
          });
          
          return standardizeAthroCharacter({
            ...char,
            examBoards
          });
        }));
      } catch (err) {
        console.error('Error fetching Athro characters:', err);
        setError(err instanceof Error ? err : new Error('Unknown error fetching characters'));
        
        // Use fallback characters if there's an error
        setCharacters([
          standardizeAthroCharacter({
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
            examBoards: ['AQA', 'EDEXCEL'] as ExamBoard[],
            topics: ['Algebra', 'Geometry', 'Statistics', 'Number']
          }),
          standardizeAthroCharacter({
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
            examBoards: ['AQA', 'EDEXCEL', 'OCR'] as ExamBoard[],
            topics: ['Biology', 'Chemistry', 'Physics']
          }),
          standardizeAthroCharacter({
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
            examBoards: ['AQA', 'EDEXCEL', 'OCR'] as ExamBoard[],
            topics: ['Language', 'Literature', 'Poetry', 'Shakespeare']
          })
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  return { characters, isLoading, error };
};
