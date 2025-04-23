
import { useEffect, useState } from 'react';
import { AthroCharacter } from '@/types/athro';
import { objectToCamelCase } from '@/utils/formatters';

export const useAthroCharacter = () => {
  const adaptCharacter = (character: AthroCharacter) => {
    return {
      ...character,
      avatarUrl: character.avatar_url,
      shortDescription: character.short_description,
      fullDescription: character.full_description,
      examBoards: character.exam_boards,
      supportedLanguages: character.supported_languages,
      supportsMathNotation: character.supports_math_notation,
      supportsSpecialCharacters: character.supports_special_characters
    };
  };

  return { adaptCharacter };
};
