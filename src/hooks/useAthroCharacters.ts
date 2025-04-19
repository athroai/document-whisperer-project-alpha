
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AthroCharacter } from '@/types/athro';

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

        setCharacters(data || []);
      } catch (err) {
        console.error('Error fetching Athro characters:', err);
        setError(err instanceof Error ? err : new Error('Unknown error fetching characters'));
        
        // Use fallback characters if there's an error
        setCharacters([
          {
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
            exam_boards: ['AQA', 'Edexcel'],
            topics: ['Algebra', 'Geometry', 'Statistics', 'Number']
          },
          {
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
            exam_boards: ['AQA', 'Edexcel', 'OCR'],
            topics: ['Biology', 'Chemistry', 'Physics']
          },
          {
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
            exam_boards: ['AQA', 'Edexcel', 'OCR'],
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
