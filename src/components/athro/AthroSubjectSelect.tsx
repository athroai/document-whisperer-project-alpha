
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAthro } from '@/contexts/AthroContext';
import { AthroSubject } from '@/types/athro';

const AthroSubjectSelect: React.FC = () => {
  const navigate = useNavigate();
  const { characters } = useAthro();
  
  const handleSubjectSelect = (subject: AthroSubject) => {
    navigate(`/athro/${subject.toLowerCase()}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Select Your Study Mentor</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map(character => (
          <Card key={character.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                {character.avatarUrl && (
                  <div className="h-12 w-12 rounded-full overflow-hidden">
                    <img 
                      src={character.avatarUrl} 
                      alt={character.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-medium">{character.name}</h3>
                  <p className="text-sm text-gray-500">{character.subject} Specialist</p>
                </div>
              </div>
              
              <p className="text-sm mb-4">{character.shortDescription}</p>
              
              <Button 
                onClick={() => handleSubjectSelect(character.subject as AthroSubject)}
                className="w-full"
              >
                Select {character.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AthroSubjectSelect;
