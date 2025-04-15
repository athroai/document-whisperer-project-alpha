
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAthro } from '@/contexts/AthroContext';
import AthroChat from '@/components/athro/AthroChat';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const AthroSubjectPage: React.FC = () => {
  const { subject } = useParams<{ subject: string }>();
  const { characters, setActiveCharacter, sendMessage, messages } = useAthro();
  const navigate = useNavigate();

  // Find the character that matches the subject from the URL
  const subjectFormatted = subject ? subject.charAt(0).toUpperCase() + subject.slice(1) : '';
  
  const character = characters.find(char => 
    char.subject.toLowerCase() === subject?.toLowerCase()
  );

  useEffect(() => {
    // If character exists, set it as active
    if (character) {
      setActiveCharacter(character);
      
      // Check if there are no messages and send a welcome message
      if (messages.length === 0) {
        const welcomeMessage = `Hello, I'm ${character.name}. How can I help with your ${character.subject} studies today?`;
        // Small delay to ensure character is set
        setTimeout(() => {
          sendMessage("welcome", character);
        }, 100);
      }
    } else {
      // If no matching character found, redirect to Athro selector page
      navigate('/athro');
    }
  }, [character, setActiveCharacter, navigate, messages.length, sendMessage]);

  if (!character) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-8">
          <p className="text-center">Loading...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {character.name}: {character.subject} Study Session
      </h1>
      <AthroChat character={character} />  {/* Pass the character prop */}
    </div>
  );
};

export default AthroSubjectPage;
