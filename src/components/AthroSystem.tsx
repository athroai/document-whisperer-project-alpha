
import React, { useState } from 'react';
import { useAthro } from '@/contexts/AthroContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import AthroChat from './athro/AthroChat';

const AthroSystem: React.FC = () => {
  const { activeCharacter } = useAthro();
  const [isOpen, setIsOpen] = useState(false);

  if (!activeCharacter) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            size="icon" 
            className="h-12 w-12 rounded-full shadow-lg"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="sr-only">Open Athro Chat</span>
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md md:max-w-lg p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center">
              <div className="h-8 w-8 mr-2 rounded-full overflow-hidden">
                <img 
                  src={activeCharacter.avatarUrl} 
                  alt={activeCharacter.name} 
                  className="h-full w-full object-cover"
                />
              </div>
              Chat with {activeCharacter.name}
            </SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100vh-80px)]">
            <AthroChat />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AthroSystem;
