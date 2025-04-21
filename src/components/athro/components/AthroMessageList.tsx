
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAthro } from "@/contexts/AthroContext";

interface AthroMessageListProps {
  messages: any[];
  isLoading?: boolean;
  chatContainerRef: React.RefObject<HTMLDivElement>;
}

export const AthroMessageList: React.FC<AthroMessageListProps> = ({
  messages,
  isLoading,
  chatContainerRef
}) => {
  const { activeCharacter } = useAthro();

  return (
    <ScrollArea ref={chatContainerRef} className="flex-grow p-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.is_student ? 'justify-start' : 'justify-end'}`}>
            <div className="flex flex-col">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`/images/characters/${activeCharacter?.avatarUrl}`} alt={activeCharacter?.name} />
                <AvatarFallback>{activeCharacter?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-xs text-gray-500">{message.is_student ? 'You' : activeCharacter?.name}</div>
            </div>
            <div className={`ml-2 p-3 rounded-lg ${message.is_student ? 'bg-gray-100 text-gray-800' : 'bg-purple-200 text-purple-800'}`}>
              {message.content}
              {message.file_name && (
                <p className="text-xs mt-1">
                  File: {message.file_name} ({message.file_size} bytes, {message.file_type})
                </p>
              )}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-center">Loading messages...</div>}
      </div>
    </ScrollArea>
  );
};
