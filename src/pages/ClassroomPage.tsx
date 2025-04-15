
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import TeacherDashboardLayout from '@/components/dashboard/TeacherDashboardLayout';

const ClassroomPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useAuth();
  const { user } = state;

  if (!user || user.role !== 'teacher') {
    return <div className="p-8">Access Restricted: Teacher role required</div>;
  }

  return (
    <TeacherDashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Classroom {id}</h1>
        <p className="text-gray-500">Manage your classroom and students</p>
        
        <Card>
          <CardHeader>
            <CardTitle>Class Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Classroom ID: {id}</p>
            <p>This page is under development. You'll be able to view class details, student list, and assignments here.</p>
          </CardContent>
        </Card>
      </div>
    </TeacherDashboardLayout>
  );
};

export default ClassroomPage;
