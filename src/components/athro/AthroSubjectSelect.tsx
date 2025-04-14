
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AthroSubject } from '@/types/athro';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAthro } from '@/contexts/AthroContext';
import { getSubjectPath } from '@/utils/subjectRouteUtils';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const AthroSubjectSelect: React.FC = () => {
  const { characters, setCurrentSubject, athroThemeForSubject } = useAthro();
  const navigate = useNavigate();
  
  const handleSelectSubject = (subject: string) => {
    console.log('Selected subject:', subject);
    setCurrentSubject(subject);
    const path = getSubjectPath(subject);
    console.log('Navigating to:', `/athro/${path}`);
    navigate(`/athro/${path}`);
  };

  if (characters.length === 0) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto" />
        <p className="mt-4 text-lg text-gray-600">Loading subjects...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-center mb-6">Select a Subject</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((character) => {
          const theme = athroThemeForSubject(character.subject);
          return (
            <Card 
              key={character.id} 
              className={cn(
                "hover:shadow-lg transition-all cursor-pointer h-full transform hover:scale-[1.02]",
                "border-2",
                "border-transparent hover:border-primary/20"
              )}
              onClick={() => handleSelectSubject(character.subject)}
            >
              <CardContent className="p-6 flex items-center space-x-4 h-full">
                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-purple-100 border">
                  {character.avatar ? (
                    <img 
                      src={character.avatar} 
                      alt={`${character.subject} icon`} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(`Failed to load image for ${character.subject}:`, character.avatar);
                        // Handle image load error
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // Prevent infinite loop
                        
                        // Use character's first letter as fallback
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-purple-200 text-purple-700 font-bold text-lg">
                            ${character.subject.substring(0, 1)}
                          </div>`;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-200 text-purple-700 font-bold text-lg">
                      {character.subject.substring(0, 1)}
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <h2 className="text-xl font-bold">{character.subject}</h2>
                  <p className="text-gray-500">{character.description || `Study ${character.subject} with Athro`}</p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-sm text-purple-600 mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectSubject(character.subject);
                    }}
                  >
                    Select this subject
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {characters.length === 0 && (
        <div className="text-center mt-8">
          <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
          <p className="mt-2 text-lg text-gray-600">No subjects available. Please check your configuration.</p>
        </div>
      )}
    </div>
  );
};

export default AthroSubjectSelect;
