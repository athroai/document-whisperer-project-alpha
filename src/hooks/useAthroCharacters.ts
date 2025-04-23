
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
          // Ensure exam_boards are properly typed as ExamBoard[]
          const examBoards: ExamBoard[] = (char.exam_boards || []).map((eb: string) => {
            if (eb === 'Edexcel') return 'EDEXCEL' as ExamBoard;
            return eb.toUpperCase() as ExamBoard;
          });
          
          return standardizeAthroCharacter({
            ...char,
            exam_boards: examBoards
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
            short_description: 'Your mathematics tutor',
            full_description: 'I can help with all areas of GCSE mathematics, from algebra to statistics.',
            avatar_url: '/avatars/athro-maths.png',
            tone: 'Clear and methodical',
            supports_math_notation: true,
            supports_special_characters: false,
            supported_languages: ['en'],
            exam_boards: ['AQA', 'EDEXCEL'] as ExamBoard[],
            topics: ['Algebra', 'Geometry', 'Statistics', 'Number']
          }),
          standardizeAthroCharacter({
            id: 'science',
            name: 'AthroScience',
            subject: 'Science',
            short_description: 'Your science tutor',
            full_description: 'I can help with physics, chemistry and biology at GCSE level.',
            avatar_url: '/avatars/athro-science.png',
            tone: 'Curious and explanatory',
            supports_math_notation: true,
            supports_special_characters: true,
            supported_languages: ['en'],
            exam_boards: ['AQA', 'EDEXCEL', 'OCR'] as ExamBoard[],
            topics: ['Biology', 'Chemistry', 'Physics']
          }),
          standardizeAthroCharacter({
            id: 'english',
            name: 'AthroEnglish',
            subject: 'English',
            short_description: 'Your English tutor',
            full_description: 'I can help with both English Language and English Literature at GCSE level.',
            avatar_url: '/avatars/athro-english.png',
            tone: 'Articulate and encouraging',
            supports_math_notation: false,
            supports_special_characters: false,
            supported_languages: ['en'],
            exam_boards: ['AQA', 'EDEXCEL', 'OCR'] as ExamBoard[],
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
