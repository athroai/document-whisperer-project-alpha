
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';

interface DayPlannerEmptyProps {
  onAddSession: () => void;
}

const DayPlannerEmpty = ({ onAddSession }: DayPlannerEmptyProps) => {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-10">
        <p className="text-muted-foreground mb-4">No study sessions planned for this day</p>
        <Button onClick={onAddSession} variant="outline">
          <Plus className="mr-1 h-4 w-4" /> Schedule a Study Session
        </Button>
      </CardContent>
    </Card>
  );
};

export default DayPlannerEmpty;
