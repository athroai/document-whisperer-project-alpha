import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { InsightsFilter } from '@/types/insights';
import insightsService from '@/services/insightsService';
import { Download, FileSpreadsheet, FileText, Calendar, BarChart3, TrendingUp, BookOpen } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ExportsTabProps {
  teacherId: string;
  filter: InsightsFilter;
  loading: boolean;
}

const ExportsTab: React.FC<ExportsTabProps> = ({ teacherId, filter, loading }) => {
  const [exportLoading, setExportLoading] = useState<{
    [key: string]: boolean;
  }>({});
  
  const handleExport = async (type: 'performance' | 'confidence' | 'topics', format: 'csv' | 'pdf') => {
    const loadingKey = `${type}-${format}`;
    
    try {
      setExportLoading({ ...exportLoading, [loadingKey]: true });
      
      let exportUrl;
      if (format === 'csv') {
        exportUrl = await insightsService.exportToCsv(teacherId, filter, type);
      } else {
        exportUrl = await insightsService.exportToPdf(teacherId, filter, type);
      }
      
      // Create a download link
      const link = document.createElement('a');
      link.href = exportUrl;
      link.download = `${type}-${filter.classId}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: `Your ${type} data has been exported as ${format.toUpperCase()}.`
      });
      
      setExportLoading({ ...exportLoading, [loadingKey]: false });
    } catch (error) {
      console.error(`Failed to export ${type} as ${format}:`, error);
      toast({
        title: "Export failed",
        description: "There was a problem generating your export. Please try again.",
        variant: "destructive"
      });
      setExportLoading({ ...exportLoading, [loadingKey]: false });
    }
  };
  
  // Export option cards
  const exportOptions = [
    {
      id: 'performance',
      title: 'Performance Report',
      description: 'Score data across students and subjects',
      icon: BarChart3,
      color: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'confidence',
      title: 'Confidence Analysis',
      description: 'Student confidence trends and comparisons',
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'topics',
      title: 'Topic Mastery Report',
      description: 'Detailed breakdown by subject and topic',
      icon: BookOpen,
      color: 'bg-green-100 text-green-700'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download size={20} />
            <span>Export Insights</span>
          </CardTitle>
          <CardDescription>
            Generate reports for your records or to share with colleagues
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exportOptions.map((option) => (
                <Card key={option.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-full ${option.color}`}>
                        <option.icon size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium">{option.title}</h3>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                        onClick={() => handleExport(option.id as any, 'csv')}
                        disabled={exportLoading[`${option.id}-csv`]}
                      >
                        {exportLoading[`${option.id}-csv`] ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Exporting
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <FileSpreadsheet size={16} className="mr-1" />
                            CSV
                          </span>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                        onClick={() => handleExport(option.id as any, 'pdf')}
                        disabled={exportLoading[`${option.id}-pdf`]}
                      >
                        {exportLoading[`${option.id}-pdf`] ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Exporting
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <FileText size={16} className="mr-1" />
                            PDF
                          </span>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} />
            <span>Scheduled Reports</span>
          </CardTitle>
          <CardDescription>
            Set up automatic report generation and delivery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Scheduled Reports</h3>
            <p className="max-w-sm mb-4">
              Set up recurring report delivery to your email or shared with administrators.
            </p>
            <Button disabled variant="outline">
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportsTab;
