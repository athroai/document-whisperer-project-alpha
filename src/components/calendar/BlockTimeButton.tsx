
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarX } from 'lucide-react';
import BlockedTimeManager from './BlockedTimeManager';

const BlockTimeButton: React.FC = () => {
  const [showManager, setShowManager] = useState(false);

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setShowManager(true)}
        className="flex items-center space-x-2"
      >
        <CalendarX className="h-4 w-4" />
        <span>Manage Blocked Times</span>
      </Button>
      
      <BlockedTimeManager 
        open={showManager} 
        onOpenChange={setShowManager} 
      />
    </>
  );
};

export default BlockTimeButton;
