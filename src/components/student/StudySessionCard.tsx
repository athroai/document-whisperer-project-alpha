
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Book, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface StudySessionCardProps {
  assignmentId: string;
  title: string;
  subject: string;
  dueDate: string;
  hasAiSupport: boolean;
}

const StudySessionCard: React.FC<StudySessionCardProps> = ({
  assignmentId,
  title,
  subject,
  dueDate,
  hasAiSupport
}) => {
  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <div className="flex items-center mt-1 text-sm text-muted-foreground">
              <Book className="h-4 w-4 mr-1" />
              <span>{subject}</span>
              <span className="mx-2">•</span>
              <Calendar className="h-4 w-4 mr-1" />
              <span>Due {format(new Date(dueDate), 'MMM d')}</span>
            </div>
          </div>
          {hasAiSupport && (
            <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
              Athro Support
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardFooter className="pt-2">
        <Link to={`/athro/${subject.toLowerCase()}`} state={{ assignmentId }}>
          <Button size="sm">
            <Play className="mr-2 h-4 w-4" />
            Start Study Session
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default StudySessionCard;
