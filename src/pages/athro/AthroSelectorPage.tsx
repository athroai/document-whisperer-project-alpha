
import React from 'react';
import { useAthro } from '@/contexts/AthroContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AthroSelectorPage: React.FC = () => {
  const { characters } = useAthro();
  const { state } = useAuth();
  const { user, loading } = state;
  const navigate = useNavigate();
  
  if (loading) {
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
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold">Choose Your Athro Mentor</h1>
        <p className="text-muted-foreground">Select a subject-specific AI mentor to help with your studies</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((character) => (
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
    </div>
  );
};

export default AthroSelectorPage;
