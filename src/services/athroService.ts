
import { supabase } from '@/lib/supabase';
import { AthroCharacter, ExamBoard, AthroSubject, AthroLanguage } from '@/types/athro';
import { standardizeAthroCharacter } from '@/utils/athroHelpers';

// Helper function to convert string exam boards to proper ExamBoard type
const convertToExamBoardType = (boards: string[]): ExamBoard[] => {
  return boards.map(board => {
    // Make sure all board values match the ExamBoard type options
    if (board === 'Edexcel') return 'EDEXCEL';
    if (board === 'AQA') return 'AQA';
    if (board === 'OCR') return 'OCR';
    if (board === 'WJEC') return 'WJEC';
    if (board === 'SQA') return 'SQA';
    if (board === 'CCEA') return 'CCEA';
    return board as ExamBoard;
  });
};

// Get all Athro characters
export const getAthroCharacters = async (): Promise<AthroCharacter[]> => {
  try {
    const { data, error } = await supabase
      .from('athro_characters')
      .select('*');
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Format the data to match AthroCharacter type
    const characters: AthroCharacter[] = data.map((char: any) => standardizeAthroCharacter({
      id: char.id,
      name: char.name,
      subject: char.subject,
      tone: char.tone,
      short_description: char.short_description,
      full_description: char.full_description,
      avatar_url: char.avatar_url,
      supports_math_notation: char.supports_math_notation,
      supports_special_characters: char.supports_special_characters,
      exam_boards: convertToExamBoardType(char.exam_boards || []),
      topics: char.topics || [],
      supported_languages: char.supported_languages
    }));
    
    return characters;
  } catch (error) {
    console.error('Error fetching Athro characters:', error);
    // Return fallback characters
    return [
      standardizeAthroCharacter({
        id: 'mathematics',
        name: 'AthroMaths',
        subject: 'Mathematics',
        short_description: 'Your mathematics mentor',
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
        short_description: 'Your science mentor',
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
        short_description: 'Your English mentor',
        full_description: 'I can help with both English Language and English Literature at GCSE level.',
        avatar_url: '/avatars/athro-english.png',
        tone: 'Articulate and encouraging',
        supports_math_notation: false,
        supports_special_characters: false,
        supported_languages: ['en'],
        exam_boards: ['AQA', 'EDEXCEL', 'OCR'] as ExamBoard[],
        topics: ['Language', 'Literature', 'Poetry', 'Shakespeare']
      })
    ];
  }
};

// Get a specific Athro character by ID
export const getAthroCharacterById = async (id: string): Promise<AthroCharacter | null> => {
  try {
    const { data, error } = await supabase
      .from('athro_characters')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      throw new Error(error?.message || 'Character not found');
    }
    
    return standardizeAthroCharacter({
      id: data.id,
      name: data.name,
      subject: data.subject,
      tone: data.tone,
      short_description: data.short_description,
      full_description: data.full_description,
      avatar_url: data.avatar_url,
      supports_math_notation: data.supports_math_notation,
      supports_special_characters: data.supports_special_characters,
      exam_boards: convertToExamBoardType(data.exam_boards || []),
      topics: data.topics || [],
      supported_languages: data.supported_languages
    });
  } catch (error) {
    console.error(`Error fetching Athro character with ID ${id}:`, error);
    return null;
  }
};
