
import React from 'react';
import { Link } from 'react-router-dom';
import { AthroSubject } from '@/types/athro';
import { Card, CardContent } from '@/components/ui/card';
import { useAthro } from '@/contexts/AthroContext';

const AthroSubjectSelect: React.FC = () => {
  const { characters, setCurrentSubject } = useAthro();
  
  const handleSelectSubject = (subject: string) => {
    setCurrentSubject(subject);
  };

  // Helper function to get route path from subject
  const getSubjectPath = (subject: string): string => {
    const pathMap: Record<string, string> = {
      'Mathematics': 'maths',
      'Religious Education': 're',
      'Study Skills': 'study-skills',
      'Computer Science': 'computer-science'
    };
    
    return pathMap[subject] || subject.toLowerCase();
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-center mb-6">Select a Subject</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((character) => (
          <Link 
            key={character.id} 
            to={`/athro/${getSubjectPath(character.subject)}`}
            onClick={() => handleSelectSubject(character.subject)}
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="p-6 flex items-center space-x-4">
                {character.avatar && (
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                    <img 
                      src={character.avatar} 
                      alt={`${character.subject} icon`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold">{character.subject}</h2>
                  <p className="text-gray-500">{character.description || `Study ${character.subject} with Athro`}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AthroSubjectSelect;
