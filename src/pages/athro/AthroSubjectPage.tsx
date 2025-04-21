
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAthro } from '@/contexts/AthroContext';
import { Card } from '@/components/ui/card';

const AthroSubjectPage: React.FC = () => {
  const { subject } = useParams<{ subject: string }>();
  const { characters, setActiveCharacter } = useAthro();
  const navigate = useNavigate();

  // Find the character that matches the subject from the URL
  const subjectFormatted = subject ? subject.charAt(0).toUpperCase() + subject.slice(1) : '';
  
  const character = characters.find(char => 
    char.subject.toLowerCase() === subject?.toLowerCase()
  );

  useEffect(() => {
    if (character) {
      // Set the active character first
      setActiveCharacter(character);
      // Instead of displaying chat here, redirect to study page with subject
      navigate(`/study?subject=${subject}`, { replace: true });
    } else {
      // If no matching character found, redirect to Athro selector page
      navigate('/athro', { replace: true });
    }
  }, [character, navigate, subject, setActiveCharacter]);

  // This will be shown briefly before redirect
  return (
    <div className="container mx-auto p-6">
      <Card className="p-8">
        <p className="text-center">Redirecting to study session...</p>
      </Card>
    </div>
  );
};

export default AthroSubjectPage;
