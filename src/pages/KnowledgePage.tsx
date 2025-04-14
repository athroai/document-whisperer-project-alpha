
import React from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import KnowledgeUploader from '@/components/knowledge/KnowledgeUploader';

const KnowledgePage: React.FC = () => {
  const { state } = useAuth();
  
  return (
    <Layout>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Knowledge Management</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>AI Knowledge Base</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-gray-600">
              Upload documents to enhance Athro's knowledge base. When you ask questions, 
              Athro will reference these documents to provide more accurate and detailed answers.
            </p>
            
            <Tabs defaultValue="upload" className="space-y-6">
              <TabsList>
                <TabsTrigger value="upload">Upload Documents</TabsTrigger>
                <TabsTrigger value="manage">Manage Knowledge</TabsTrigger>
                <TabsTrigger value="shared">Shared Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload">
                <KnowledgeUploader />
              </TabsContent>
              
              <TabsContent value="manage">
                <Card>
                  <CardHeader>
                    <CardTitle>My Knowledge Library</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Here you can manage all your uploaded documents and organize them by subject and topic.
                    </p>
                    {/* Document management interface will be added here */}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="shared">
                <Card>
                  <CardHeader>
                    <CardTitle>Shared Knowledge</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Documents that have been shared with you by teachers or other students.
                    </p>
                    {/* Shared documents interface will be added here */}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default KnowledgePage;
