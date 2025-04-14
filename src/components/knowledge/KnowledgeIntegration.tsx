
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, Upload } from 'lucide-react';
import KnowledgeUploader from './KnowledgeUploader';
import { useAuth } from '@/contexts/AuthContext';

interface KnowledgeIntegrationProps {
  subject?: string;
  onClose?: () => void;
}

const KnowledgeIntegration: React.FC<KnowledgeIntegrationProps> = ({ 
  subject,
  onClose 
}) => {
  const { state } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('upload');
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Knowledge Management</CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="upload" className="flex items-center">
              <Upload className="mr-2 h-4 w-4" />
              Upload Documents
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center">
              <Book className="mr-2 h-4 w-4" />
              Manage Knowledge
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <KnowledgeUploader />
          </TabsContent>
          
          <TabsContent value="manage">
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold mb-2">Manage Your Knowledge Base</h3>
              <p className="text-gray-600 mb-4">
                Here you can view, organize, and share your uploaded documents.
              </p>
              <Button onClick={() => setActiveTab('upload')}>
                Upload New Documents
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default KnowledgeIntegration;
