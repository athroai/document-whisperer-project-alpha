
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AthroCharacter } from '@/types/athro';
import { Calculator, Circle, BookOpen, Infinity, Sigma } from 'lucide-react';

interface AthroCharacterCardProps {
  character: AthroCharacter;
  onSelect: (character: AthroCharacter) => void;
  isActive?: boolean;
}

const AthroCharacterCard: React.FC<AthroCharacterCardProps> = ({
  character,
  onSelect,
  isActive = false
}) => {
  // Get subject-specific icon
  const getSubjectIcon = () => {
    switch (character.subject) {
      case 'Mathematics':
        return <Calculator className="h-5 w-5 text-purple-600" />;
      case 'Science':
        return <Circle className="h-5 w-5 text-green-600" />;
      default:
        return <BookOpen className="h-5 w-5 text-blue-600" />;
    }
  };

  // Get subject-specific capabilities
  const getSpecialCapabilities = () => {
    const capabilities = [];
    
    if (character.supportsMathNotation) {
      capabilities.push('Mathematical notation');
    }
    
    if (character.supportsSpecialCharacters) {
      capabilities.push('Special characters');
    }
    
    if (character.supportedLanguages && character.supportedLanguages.length > 0) {
      capabilities.push(`${character.supportedLanguages.join(', ')} support`);
    }
    
    return capabilities;
  };

  return (
    <Card className={`overflow-hidden transition-all ${isActive ? 'border-purple-500 shadow-md' : 'hover:shadow-md'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-full">
            <img
              src={character.avatar || character.avatarUrl}
              alt={character.name || character.subject}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              {character.name || `Athro ${character.subject}`}
              {getSubjectIcon()}
            </CardTitle>
            <CardDescription>{character.shortDescription || character.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground">
          {character.subject} expert
          {character.examBoards?.length ? 
            ` with knowledge of ${character.examBoards.join(', ')} exam boards` : ''}
        </p>
        
        {getSpecialCapabilities().length > 0 && (
          <div className="mt-1">
            <p className="text-xs text-purple-600 font-medium">
              Special capabilities: {getSpecialCapabilities().join(', ')}
            </p>
          </div>
        )}
        
        {character.topics && character.topics.length > 0 && (
          <div className="mt-2">
            <h4 className="text-sm font-medium">Topics:</h4>
            <div className="mt-1 flex flex-wrap gap-1">
              {character.topics.slice(0, 3).map((topic) => (
                <span
                  key={topic}
                  className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs text-purple-800"
                >
                  {topic}
                </span>
              ))}
              {character.topics.length > 3 && (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-800">
                  +{character.topics.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          variant={isActive ? "default" : "outline"}
          onClick={() => onSelect(character)}
          className="w-full"
        >
          {isActive ? 'Currently Active' : 'Select Character'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AthroCharacterCard;
