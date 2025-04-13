
import React from 'react';
import KnowledgeManagement from '@/components/admin/KnowledgeManagement';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const KnowledgeBasePage: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;

  // Redirect non-admin users
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Knowledge Base Management</h1>
      <p className="text-gray-600 mb-8">
        Upload and manage documents that enhance the Athro AI knowledge base. Uploaded content will be processed, chunked, 
        and made available to the AI system to improve responses.
      </p>
      <KnowledgeManagement />
    </div>
  );
};

export default KnowledgeBasePage;
