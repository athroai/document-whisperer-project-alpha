
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import KnowledgeManagement from '@/components/admin/KnowledgeManagement';
import AdminMenu from '@/components/admin/AdminMenu';
import { Card, CardContent } from '@/components/ui/card';

const KnowledgeBasePage: React.FC = () => {
  const { state } = useAuth();
  const { hasAccess, message } = useRoleAccess(state.user, 'admin');

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
        <KnowledgeManagement />
      </main>
    </div>
  );
};

export default KnowledgeBasePage;
