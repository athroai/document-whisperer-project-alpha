
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from '@/components/ui/card';
import UploadFilePanel from '@/components/files/UploadFilePanel';
import FileBrowser from '@/components/files/FileBrowser';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { FileUp, FileText } from 'lucide-react';

const FilesPage: React.FC = () => {
  const { state } = useAuth();
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [selectedTab, setSelectedTab] = useState('browser');

  const handleUploadComplete = () => {
    setShowUploadPanel(false);
    setSelectedTab('browser');
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Files &amp; Uploads</h1>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="browser" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Browse Files
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center">
            <FileUp className="h-4 w-4 mr-2" />
            Upload New
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="browser" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <FileBrowser 
                onUploadClick={() => setSelectedTab('upload')}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upload">
          <Card>
            <CardContent className="pt-6">
              <UploadFilePanel
                onUploadComplete={handleUploadComplete}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Mobile Upload Dialog */}
      <Dialog open={showUploadPanel} onOpenChange={setShowUploadPanel}>
        <DialogContent>
          <UploadFilePanel
            onClose={() => setShowUploadPanel(false)}
            onUploadComplete={handleUploadComplete}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FilesPage;
