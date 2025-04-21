
import { supabase } from '@/lib/supabase';
import { AthroCharacter, ExamBoard, AthroSubject, AthroLanguage } from '@/types/athro';

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
    const characters: AthroCharacter[] = data.map((char: any) => ({
      id: char.id,
      name: char.name,
      subject: char.subject,
      tone: char.tone,
      shortDescription: char.short_description,
      fullDescription: char.full_description,
      avatarUrl: char.avatar_url,
      supportsMathNotation: char.supports_math_notation,
      supportsSpecialCharacters: char.supports_special_characters,
      examBoards: convertToExamBoardType(char.exam_boards || []),
      topics: char.topics || [],
      supportedLanguages: char.supported_languages
    }));
    
    return characters;
  } catch (error) {
    console.error('Error fetching Athro characters:', error);
    // Return fallback characters
    return [
      {
        id: 'mathematics',
        name: 'AthroMaths',
        subject: 'Mathematics',
        shortDescription: 'Your mathematics mentor',
        fullDescription: 'I can help with all areas of GCSE mathematics, from algebra to statistics.',
        avatarUrl: '/avatars/athro-maths.png',
        tone: 'Clear and methodical',
        supportsMathNotation: true,
        supportsSpecialCharacters: false,
        supportedLanguages: ['en'],
        examBoards: ['AQA', 'EDEXCEL'] as ExamBoard[],
        topics: ['Algebra', 'Geometry', 'Statistics', 'Number']
      },
      {
        id: 'science',
        name: 'AthroScience',
        subject: 'Science',
        shortDescription: 'Your science mentor',
        fullDescription: 'I can help with physics, chemistry and biology at GCSE level.',
        avatarUrl: '/avatars/athro-science.png',
        tone: 'Curious and explanatory',
        supportsMathNotation: true,
        supportsSpecialCharacters: true,
        supportedLanguages: ['en'],
        examBoards: ['AQA', 'EDEXCEL', 'OCR'] as ExamBoard[],
        topics: ['Biology', 'Chemistry', 'Physics']
      },
      {
        id: 'english',
        name: 'AthroEnglish',
        subject: 'English',
        shortDescription: 'Your English mentor',
        fullDescription: 'I can help with both English Language and English Literature at GCSE level.',
        avatarUrl: '/avatars/athro-english.png',
        tone: 'Articulate and encouraging',
        supportsMathNotation: false,
        supportsSpecialCharacters: false,
        supportedLanguages: ['en'],
        examBoards: ['AQA', 'EDEXCEL', 'OCR'] as ExamBoard[],
        topics: ['Language', 'Literature', 'Poetry', 'Shakespeare']
      }
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
    
    return {
      id: data.id,
      name: data.name,
      subject: data.subject,
      tone: data.tone,
      shortDescription: data.short_description,
      fullDescription: data.full_description,
      avatarUrl: data.avatar_url,
      supportsMathNotation: data.supports_math_notation,
      supportsSpecialCharacters: data.supports_special_characters,
      examBoards: convertToExamBoardType(data.exam_boards || []),
      topics: data.topics || [],
      supportedLanguages: data.supported_languages
    };
  } catch (error) {
    console.error(`Error fetching Athro character with ID ${id}:`, error);
    return null;
  }
};
