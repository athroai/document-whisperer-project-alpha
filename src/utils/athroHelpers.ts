
import { AthroCharacter } from '@/types/athro';

/**
 * Utility function to standardize Athro character property names
 * This helps with legacy code that might be using different property names
 */
export function standardizeAthroCharacter(character: any): AthroCharacter {
  if (!character) return null;

  // Return a standardized character with correct property names
  return {
    id: character.id,
    name: character.name,
    subject: character.subject,
    avatar_url: character.avatar_url || character.avatarUrl,
    short_description: character.short_description || character.shortDescription,
    full_description: character.full_description || character.fullDescription,
    tone: character.tone,
    exam_boards: character.exam_boards || character.examBoards,
    topics: character.topics,
    supported_languages: character.supported_languages || character.supportedLanguages,
    supports_math_notation: character.supports_math_notation || character.supportsMathNotation,
    supports_special_characters: character.supports_special_characters || character.supportsSpecialCharacters
  };
}

/**
 * Standardize an array of Athro characters
 */
export function standardizeAthroCharacters(characters: any[]): AthroCharacter[] {
  if (!characters || !Array.isArray(characters)) return [];
  return characters.map(standardizeAthroCharacter);
}

/**
 * Helper function to provide backward compatibility for components using camelCase properties
 */
export function getAthroCharacterProperty(character: AthroCharacter, key: string): any {
  switch (key) {
    case 'avatarUrl':
      return character.avatar_url;
    case 'shortDescription':
      return character.short_description;
    case 'fullDescription':
      return character.full_description;
    case 'examBoards':
      return character.exam_boards;
    case 'supportedLanguages':
      return character.supported_languages;
    case 'supportsMathNotation':
      return character.supports_math_notation;
    case 'supportsSpecialCharacters':
      return character.supports_special_characters;
    default:
      return character[key];
  }
}
