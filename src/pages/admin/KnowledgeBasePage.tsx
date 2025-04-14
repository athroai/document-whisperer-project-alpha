
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import KnowledgeManagement from '@/components/admin/KnowledgeManagement';
import AdminMenu from '@/components/admin/AdminMenu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getKnowledgeDocuments } from '@/services/knowledgeBaseService';
import { UploadedDocument } from '@/types/knowledgeBase';
import { 
  Database, 
  FileText, 
  FileType, 
  BrainCircuit, 
  Server, 
  AlertTriangle, 
  CheckCircle2 
} from 'lucide-react';

const KnowledgeBasePage: React.FC = () => {
  const { state } = useAuth();
  const { hasAccess, message } = useRoleAccess(state.user, 'admin');
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch data if the user has access
    if (hasAccess) {
      const loadData = async () => {
        setLoading(true);
        try {
          const docs = await getKnowledgeDocuments();
          setDocuments(docs);
        } catch (error) {
          console.error('Error loading documents:', error);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }
  }, [hasAccess]);

  // Calculate summary stats
  const totalDocuments = documents.length;
  const processedDocuments = documents.filter(doc => doc.status === 'indexed').length;
  const failedDocuments = documents.filter(doc => doc.status === 'failed').length;
  const publicDocuments = documents.filter(doc => doc.isPubliclyUsable).length;
  
  // Calculate total chunks
  const totalChunks = documents.reduce((sum, doc) => sum + (doc.chunkCount || 0), 0);
  
  // Calculate total storage size
  const totalStorageBytes = documents.reduce((sum, doc) => sum + doc.fileSize, 0);
  const formatStorageSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Group documents by subject
  const subjectCounts: Record<string, number> = {};
  documents.forEach(doc => {
    if (doc.subject) {
      subjectCounts[doc.subject] = (subjectCounts[doc.subject] || 0) + 1;
    } else {
      subjectCounts['Unspecified'] = (subjectCounts['Unspecified'] || 0) + 1;
    }
  });

  // If user is not an admin, show access denied message
  if (!hasAccess) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <main className="flex-1 p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6 min-h-[300px]">
              <h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
              <p className="text-gray-600">{message || 'You do not have permission to access this page.'}</p>
              <p className="text-gray-500 mt-2">This section is restricted to administrators only.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminMenu />
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Knowledge Base Management</h1>
          <p className="text-gray-500">Upload, manage, and organize trusted learning resources</p>
        </div>

        {/* Knowledge Base Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Documents</p>
                <h3 className="text-2xl font-bold">{totalDocuments}</h3>
                {!loading && (
                  <p className="text-xs text-gray-500">
                    {processedDocuments} indexed, {failedDocuments} failed
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <FileType className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Chunks</p>
                <h3 className="text-2xl font-bold">{totalChunks}</h3>
                {!loading && publicDocuments > 0 && (
                  <p className="text-xs text-gray-500">
                    From {publicDocuments} public documents
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <BrainCircuit className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">AI Referencing</p>
                <h3 className="text-xl font-bold">Enabled</h3>
                {!loading && (
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                    Vector search active
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="bg-amber-100 p-3 rounded-full mr-4">
                <Server className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Storage Used</p>
                <h3 className="text-2xl font-bold">{formatStorageSize(totalStorageBytes)}</h3>
                {!loading && totalDocuments > 0 && (
                  <p className="text-xs text-gray-500">
                    Across {totalDocuments} documents
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <KnowledgeManagement />
      </main>
    </div>
  );
};

export default KnowledgeBasePage;
