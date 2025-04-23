
import React from 'react';
import { AthroCharacter } from '@/types/athro';
import { getAthroCharacterProperty } from './athroHelpers';

// This is a Higher-Order Component (HOC) that adapts components expecting
// the old camelCase property names to work with the new snake_case properties
export function withAthroCharacterAdapter<P extends { character: AthroCharacter }>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return (props: P) => {
    const { character, ...otherProps } = props;
    
    // Create a Proxy that intercepts property access and maps to the correct property name
    const adaptedCharacter = new Proxy(character, {
      get: (target, prop) => {
        // Convert string props to their equivalent on AthroCharacter
        if (typeof prop === 'string') {
          return getAthroCharacterProperty(target, prop);
        }
        return Reflect.get(target, prop);
      }
    }) as AthroCharacter;
    
    return <Component {...otherProps as any} character={adaptedCharacter} />;
  };
}

// Utility function for adapting character objects in non-component contexts
export function adaptAthroCharacter(character: AthroCharacter): any {
  return {
    ...character,
    // Add camelCase aliases for snake_case properties
    avatarUrl: character.avatar_url,
    shortDescription: character.short_description,
    fullDescription: character.full_description,
    examBoards: character.exam_boards,
    supportedLanguages: character.supported_languages, 
    supportsMathNotation: character.supports_math_notation,
    supportsSpecialCharacters: character.supports_special_characters
  };
}
