
import React, { useState, useEffect } from 'react';
import { useAthro } from '@/contexts/AthroContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import AthroChat from './athro/AthroChat';
import { toast } from '@/hooks/use-toast';

const AthroSystem: React.FC = () => {
  const { activeCharacter, messages, sendMessage } = useAthro();
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  
  // Log component mount for debugging
  useEffect(() => {
    console.log('🎮 AthroSystem component mounted');
    
    // CRITICAL: No automatic messages should be sent here
    // Previous implementation had a greeting here that was removed
    
    return () => console.log('🎮 AthroSystem component unmounted');
  }, []);

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);
      return;
    }
    
    // If new messages come in while the chat is closed, show notification
    if (messages.length > 0 && !isOpen && messages[messages.length - 1].senderId !== 'user') {
      toast({
        title: `${activeCharacter?.name || 'Athro AI'} replied`,
        description: "Click the chat button to view the message",
        duration: 5000,
      });
    }
  }, [messages, isOpen, activeCharacter, isInitialRender]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            size="icon" 
            className="h-12 w-12 rounded-full shadow-lg relative bg-purple-600 hover:bg-purple-700"
          >
            <MessageCircle className="h-6 w-6 text-white" />
            {messages.length > 0 && !isOpen && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {messages.filter(m => m.senderId !== 'user').length}
              </span>
            )}
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
