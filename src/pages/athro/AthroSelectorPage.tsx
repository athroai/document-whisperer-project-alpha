
import React from 'react';
import { useAthro } from '@/contexts/AthroContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Book, BookText, Atom, Languages, History, MapPin, BookOpen, Brain, Clock } from 'lucide-react';

const AthroSelectorPage: React.FC = () => {
  const { characters } = useAthro();
  const navigate = useNavigate();
  
  // Filter out system characters
  const subjectCharacters = characters.filter(char => 
    !['AthroAI', 'Timekeeper', 'System'].includes(char.subject)
  );
  
  // System characters
  const systemCharacters = characters.filter(char => 
    ['AthroAI', 'Timekeeper', 'System'].includes(char.subject)
  );
  
  // Get subject-specific icon
  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case 'Mathematics':
        return <BookText className="h-5 w-5 text-purple-600" />;
      case 'Science':
        return <Atom className="h-5 w-5 text-green-600" />;
      case 'English':
        return <Book className="h-5 w-5 text-blue-600" />;
      case 'History':
        return <History className="h-5 w-5 text-amber-600" />;
      case 'Geography':
        return <MapPin className="h-5 w-5 text-cyan-600" />;
      case 'Languages':
        return <Languages className="h-5 w-5 text-pink-600" />;
      case 'Welsh':
        return <Languages className="h-5 w-5 text-red-600" />;
      case 'Religious Education':
        return <BookOpen className="h-5 w-5 text-violet-600" />;
      case 'AthroAI':
        return <Brain className="h-5 w-5 text-indigo-600" />;
      case 'Timekeeper':
        return <Clock className="h-5 w-5 text-amber-600" />;
      default:
        return <BookOpen className="h-5 w-5 text-gray-600" />;
    }
  };
  
  // Helper function to convert subject name to URL path
  const getSubjectPath = (subject: string): string => {
    return subject.toLowerCase().replace(/ /g, '-');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold">Choose Your Athro Mentor</h1>
        <p className="text-muted-foreground">Select a subject-specific AI mentor to help with your studies</p>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Subject Mentors</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {subjectCharacters.map((character) => (
          <Card key={character.id} className="transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
                  <img 
                    src={character.avatarUrl} 
                    alt={character.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <CardTitle className="flex items-center">
                    {character.name} {getSubjectIcon(character.subject)}
                  </CardTitle>
                  <CardDescription>{character.shortDescription}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{character.fullDescription}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {character.topics.slice(0, 3).map((topic) => (
                  <span 
                    key={topic} 
                    className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium"
                  >
                    {topic}
                  </span>
                ))}
                {character.topics.length > 3 && (
                  <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                    +{character.topics.length - 3} more
                  </span>
                )}
              </div>
              <Button 
                className="w-full" 
                onClick={() => navigate(`/study?subject=${getSubjectPath(character.subject)}`)}
              >
                Study with {character.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <h2 className="text-xl font-semibold mb-4">System Characters</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {systemCharacters.map((character) => (
          <Card key={character.id} className="transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                  <img 
                    src={character.avatarUrl} 
                    alt={character.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <CardTitle className="flex items-center text-base">
                    {character.name} {getSubjectIcon(character.subject)}
                  </CardTitle>
                  <CardDescription className="text-sm">{character.shortDescription}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline"
                className="w-full" 
                onClick={() => navigate(`/study?subject=${character.subject.toLowerCase()}`)}
              >
                Open {character.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AthroSelectorPage;
