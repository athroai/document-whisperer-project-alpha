import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAthro } from '@/contexts/AthroContext';
import { Star, CircleHelp, Circle, HelpCircle, BookOpen, Atom, Book, History, MapPin, Languages } from 'lucide-react';

interface SubjectCardProps {
  subject: string;
  confidence?: number;
  progress?: number;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, confidence = 5, progress = 0 }) => {
  const { characters } = useAthro();
  
  const character = characters.find(char => 
    char.subject.toLowerCase() === subject.toLowerCase()
  ) || characters.find(char => char.id === 'athroai'); // Fallback to AthroAI
  
  const getConfidenceIcon = () => {
    if (confidence >= 8) return <Star className="h-5 w-5 text-yellow-500" />;
    if (confidence >= 5) return <CircleHelp className="h-5 w-5 text-amber-500" />;
    if (confidence >= 1) return <Circle className="h-5 w-5 text-orange-500" />;
    return <HelpCircle className="h-5 w-5 text-gray-500" />;
  };
  
  const getSubjectIcon = () => {
    const subjectLower = subject.toLowerCase();
    
    if (subjectLower.includes('math')) return <BookOpen className="h-5 w-5 text-purple-600" />;
    if (subjectLower.includes('science')) return <Atom className="h-5 w-5 text-green-600" />;
    if (subjectLower.includes('english')) return <Book className="h-5 w-5 text-blue-600" />;
    if (subjectLower.includes('history')) return <History className="h-5 w-5 text-amber-600" />;
    if (subjectLower.includes('geography')) return <MapPin className="h-5 w-5 text-cyan-600" />;
    if (subjectLower.includes('language') || subjectLower.includes('welsh')) return <Languages className="h-5 w-5 text-pink-600" />;
    
    return <BookOpen className="h-5 w-5 text-gray-600" />;
  };
  
  const capitalizedSubject = subject.charAt(0).toUpperCase() + subject.slice(1);
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{capitalizedSubject}</CardTitle>
            {character && (
              <p className="text-sm text-gray-500">with {character.name}</p>
            )}
          </div>
          <div className="flex items-center">
            {getConfidenceIcon()}
            {character && character.avatarUrl && (
              <div className="w-10 h-10 rounded-full overflow-hidden ml-2">
                <img 
                  src={character.avatarUrl} 
                  alt={character.name || subject}
                  className="w-full h-full object-cover" 
                />
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-purple-600 h-2.5 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">{progress}% complete</p>
      </CardContent>
      <CardFooter className="pt-0">
        <Link to={`/study?subject=${encodeURIComponent(subject.toLowerCase())}`} className="w-full">
          <Button variant="outline" className="w-full">
            {getSubjectIcon()}
            <span className="ml-2">Start studying</span>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
