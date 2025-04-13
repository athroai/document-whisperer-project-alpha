
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileQuestion } from 'lucide-react';

const NoProgressData: React.FC = () => {
  return (
    <Card className="w-full text-center py-8 border-dashed">
      <CardContent className="pt-6">
        <div className="flex justify-center mb-4">
          <FileQuestion className="h-16 w-16 text-muted-foreground" />
        </div>
        <CardTitle className="text-xl mb-2">No Progress Data Available</CardTitle>
        <p className="text-muted-foreground">
          Start using Athro to study and complete assignments to see your progress here.
        </p>
      </CardContent>
    </Card>
  );
};

export default NoProgressData;
