
import React from 'react';
import { useParams } from 'react-router-dom';
import AthroChat from '@/components/athro/AthroChat';
import { AthroCharacter } from '@/types/athroCharacter';

const ChatPage: React.FC = () => {
  const { characterId } = useParams();
  
  // Convert the string ID to the required AthroCharacter type
  // This assumes that AthroMaths is a valid AthroCharacter value
  const character = (characterId || 'AthroMaths') as AthroCharacter;
  
  return (
    <div className="container mx-auto p-4 h-[calc(100vh-5rem)]">
      <AthroChat character={character} />
    </div>
  );
};

export default ChatPage;
