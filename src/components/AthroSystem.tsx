
import React, { useState } from 'react';
import { useAthro } from '@/contexts/AthroContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import AthroChat from './athro/AthroChat';

const AthroSystem: React.FC = () => {
  const { activeCharacter, sendMessage } = useAthro();
  const [isOpen, setIsOpen] = useState(false);

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
                  src={activeCharacter?.avatarUrl || '/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png'} 
                  alt={activeCharacter?.name || 'Athro AI'} 
                  className="h-full w-full object-cover"
                />
              </div>
              Chat with {activeCharacter?.name || 'Athro AI'}
            </SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100vh-80px)]">
            <AthroChat isCompactMode={true} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AthroSystem;
