
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AthroCharacter } from '@/types/athro';

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
  return (
    <Card className={`overflow-hidden transition-all ${isActive ? 'border-purple-500 shadow-md' : 'hover:shadow-md'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-full">
            <img
              src={character.avatarUrl}
              alt={character.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <CardTitle>{character.name}</CardTitle>
            <CardDescription>{character.shortDescription}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground">
          {character.subject} expert with knowledge of {character.examBoards.join(', ')} exam boards
        </p>
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
