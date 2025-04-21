import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// Fix the argument issue
const CreateInitialEvents = () => {
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const handleCreateEvents = () => {
    setIsCreating(true);
    // Simulate event creation
    setTimeout(() => {
      setIsCreating(false);
      // Fix the call that had too many arguments
      navigate('/home', { replace: true });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Create Initial Study Events</h2>
      <p className="text-sm text-muted-foreground">
        We'll create some initial study events based on your availability.
      </p>
      <Button onClick={handleCreateEvents} disabled={isCreating}>
        {isCreating ? 'Creating Events...' : 'Create Events'}
      </Button>
    </div>
  );
};

export default CreateInitialEvents;
