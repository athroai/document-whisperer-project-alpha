
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileBarChart } from 'lucide-react';

const NoAnalyticsData: React.FC = () => {
  return (
    <Card className="w-full text-center py-8 border-dashed">
      <CardContent className="pt-6">
        <div className="flex justify-center mb-4">
          <FileBarChart className="h-16 w-16 text-muted-foreground" />
        </div>
        <CardTitle className="text-xl mb-2">No Analytics Data Available</CardTitle>
        <p className="text-muted-foreground">
          No analytics data could be found. Try adjusting your filters or check back later.
        </p>
      </CardContent>
    </Card>
  );
};

export default NoAnalyticsData;
