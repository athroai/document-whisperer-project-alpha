
import React from 'react';
import { useParams } from 'react-router-dom';
import AthroChat from '@/components/athro/AthroChat';

const ChatPage: React.FC = () => {
  const { characterId } = useParams();
  
  return (
    <div className="container mx-auto p-4 h-[calc(100vh-5rem)]">
      <AthroChat character={characterId} />
    </div>
  );
};

export default ChatPage;
