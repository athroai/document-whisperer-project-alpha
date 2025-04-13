import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InsightsFilter } from '@/types/insights';
import insightsService from '@/services/insightsService';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, FileText, Download, Calendar, Users, BarChart, LineChart } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ExportsTabProps {
  teacherId: string;
  filter: InsightsFilter;
  loading: boolean;
}

interface ExportOption {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  formats: Array<{
    id: string;
    name: string;
    extension: string;
    icon: React.ElementType;
    type: 'performance' | 'confidence' | 'topics';
  }>;
}

const ExportsTab: React.FC<ExportsTabProps> = ({ teacherId, filter, loading }) => {
  const [exportingType, setExportingType] = useState<string | null>(null);

  const exportOptions: ExportOption[] = [
    {
      id: 'performance',
      title: 'Performance Report',
      description: 'Student performance metrics across subjects and topics',
      icon: BarChart,
      formats: [
        { id: 'perf-csv', name: 'CSV Spreadsheet', extension: 'csv', icon: FileSpreadsheet, type: 'performance' },
        { id: 'perf-pdf', name: 'PDF Document', extension: 'pdf', icon: FileText, type: 'performance' }
      ]
    },
    {
      id: 'confidence',
      title: 'Confidence Analysis',
      description: 'Student self-reported confidence trends over time',
      icon: LineChart,
      formats: [
        { id: 'conf-csv', name: 'CSV Spreadsheet', extension: 'csv', icon: FileSpreadsheet, type: 'confidence' },
        { id: 'conf-pdf', name: 'PDF Document', extension: 'pdf', icon: FileText, type: 'confidence' }
      ]
    },
    {
      id: 'topics',
      title: 'Topic Mastery Report',
      description: 'Detailed breakdown of student performance by topic',
      icon: Users,
      formats: [
        { id: 'topic-csv', name: 'CSV Spreadsheet', extension: 'csv', icon: FileSpreadsheet, type: 'topics' },
        { id: 'topic-pdf', name: 'PDF Document', extension: 'pdf', icon: FileText, type: 'topics' }
      ]
    },
  ];

  const handleExport = async (formatId: string, type: 'performance' | 'confidence' | 'topics', extension: string) => {
    setExportingType(formatId);
    try {
      let url;
      if (extension === 'csv') {
        url = await insightsService.exportToCsv(teacherId, filter, type);
      } else {
        url = await insightsService.exportToPdf(teacherId, filter, type);
      }
      
      // Create temporary anchor to trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-data-${filter.classId}-${new Date().toISOString().split('T')[0]}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Export successful",
        description: `Your ${type} data has been exported as a ${extension.toUpperCase()} file.`,
      });
    } catch (error) {
      console.error(`Failed to export ${extension}:`, error);
      toast({
        title: "Export failed",
        description: "There was a problem generating your export. Please try again.",
        variant: "destructive"
      });
    } finally {
      setExportingType(null);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Export student performance and confidence data in various formats for offline analysis or presentations.
      </p>
      
      <div className="grid gap-6 md:grid-cols-2">
        {exportOptions.map((option) => (
          <Card key={option.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <option.icon className="h-5 w-5" />
                  {option.title}
                </CardTitle>
              </div>
              <CardDescription>{option.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {option.formats.map((format) => (
                  <Button 
                    key={format.id}
                    variant="outline" 
                    className="justify-start"
                    onClick={() => handleExport(format.id, format.type, format.extension)}
                    disabled={exportingType === format.id || loading}
                  >
                    {exportingType === format.id ? (
                      <>
                        <Calendar className="mr-2 h-4 w-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <format.icon className="mr-2 h-4 w-4" />
                        Export as {format.name}
                      </>
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ExportsTab;
