
import React from 'react';
import { useAthro } from '@/contexts/AthroContext';
import { useStudentClass } from '@/contexts/StudentClassContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const AthroSelectorPage: React.FC = () => {
  const { characters } = useAthro();
  const { state } = useAuth();
  const { user, loading } = state;
  const { enrolledSubjects, loading: loadingClasses, isMockEnrollment } = useStudentClass();
  const navigate = useNavigate();
  
  if (loading || loadingClasses) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Loading...</h2>
          <p className="text-gray-600">Setting up your Athro experience</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect teachers and admins to the teacher dashboard
  if (user.role === 'teacher' || user.role === 'admin') {
    return <Navigate to="/teacher-dashboard" replace />;
  }
  
  // Filter characters based on student's enrolled subjects
  const filteredCharacters = characters.filter(character => 
    enrolledSubjects.some(subject => 
      subject.subject.toLowerCase() === character.subject.toLowerCase()
    )
  );
  
  // If student is not enrolled in any subjects, show enrollment message
  if (enrolledSubjects.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not assigned to any classes</AlertTitle>
          <AlertDescription>
            You're not currently assigned to any classes. Please ask your teacher to add you.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>Teacher Assignment Required</CardTitle>
            <CardDescription>Your teacher will need to add you to their class</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Students can only be added to classes by teachers through the teacher dashboard. 
              Once you've been added to a class, you'll be able to access your study mentors here.
            </p>
            <Button onClick={() => navigate('/home')}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If no characters are available for enrolled subjects
  if (filteredCharacters.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">No Study Mentors Available</h1>
          <p className="text-muted-foreground">There are no study mentors available for your enrolled subjects</p>
        </div>
        
        <Alert>
          <BookOpen className="h-4 w-4" />
          <AlertTitle>Enrolled Subjects</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside mt-2">
              {enrolledSubjects.map((subject) => (
                <li key={subject.subject}>{subject.subject} with {subject.teacherName} ({subject.className})</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {isMockEnrollment && (
        <Alert className="mb-6 bg-blue-50 text-blue-800 border-blue-200">
          <Info className="h-4 w-4" />
          <AlertTitle>Mock Enrollment Active</AlertTitle>
          <AlertDescription>
            You're viewing mock classes for testing purposes. These are not real class assignments.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold">Choose Your Athro Mentor</h1>
        <p className="text-muted-foreground">Select a subject-specific AI mentor to help with your studies</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCharacters.map((character) => (
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
                  <CardTitle>{character.name}</CardTitle>
                  <CardDescription>{character.shortDescription}</CardDescription>
                  {isMockEnrollment && (
                    <Badge className="mt-2 bg-blue-50 text-blue-700 border-blue-200">
                      Mock Character
                    </Badge>
                  )}
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
                onClick={() => navigate(`/athro/${character.subject.toLowerCase()}`)}
              >
                Study with {character.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-medium mb-4">Your Classes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrolledSubjects.map((subject) => (
            <Card key={subject.subject + subject.classId}>
              <CardHeader>
                <CardTitle>{subject.subject}</CardTitle>
                <CardDescription>
                  {subject.className} - {subject.yearGroup}
                  {isMockEnrollment && (
                    <Badge className="ml-2 bg-blue-50 text-blue-700 border-blue-200">Mock</Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Teacher: {subject.teacherName}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AthroSelectorPage;
