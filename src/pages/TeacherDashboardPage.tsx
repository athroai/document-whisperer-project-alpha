
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Bell, BarChart3, FileCheck, BookOpen, Loader2 } from 'lucide-react';
import TeacherDashboardLayout from '@/components/dashboard/TeacherDashboardLayout';
import { Class } from '@/types/teacher';

const TeacherDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const { user, loading: authLoading } = state;
  const [classStats, setClassStats] = useState({
    total: 0,
    subjects: 0,
    students: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTeacherData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Wait for auth to complete first
        if (!authLoading && user && user.role === 'teacher') {
          // In a real implementation, fetch stats from Firestore
          // For now, just mocking the data with a slight delay to simulate API call
          await new Promise(resolve => setTimeout(resolve, 800));
          
          setClassStats({
            total: 4,
            subjects: 3, // Math, Science, English
            students: 32
          });
        } else if (!authLoading && (!user || user.role !== 'teacher')) {
          setError('Access restricted: Teacher role required');
        }
      } catch (err) {
        console.error('Failed to load teacher dashboard data:', err);
        setError('Failed to load teacher data. Please try refreshing.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTeacherData();
  }, [user, authLoading]);

  // Quick stats for dashboard overview
  const stats = [
    { 
      title: "Students", 
      value: classStats.students.toString(), 
      description: `Across ${classStats.subjects} subjects`, 
      icon: Users,
      color: "bg-blue-100 text-blue-700" 
    },
    { 
      title: "Notifications", 
      value: "8", 
      description: "Requiring attention", 
      icon: Bell,
      color: "bg-amber-100 text-amber-700"
    },
    { 
      title: "Assignments", 
      value: "5", 
      description: "Pending marking", 
      icon: FileCheck,
      color: "bg-green-100 text-green-700"
    },
    { 
      title: "Classes", 
      value: classStats.total.toString(), 
      description: `${classStats.subjects} subjects`, 
      icon: BookOpen,
      color: "bg-purple-100 text-purple-700"
    }
  ];

  // Dashboard actions
  const actions = [
    { 
      title: "Manage Sets", 
      description: "View and manage your class sets", 
      buttonText: "Open Sets",
      href: "/teacher/sets" 
    },
    { 
      title: "Mark Assignments", 
      description: "Review and grade student work", 
      buttonText: "Open Marking Panel",
      href: "/teacher/marking" 
    },
    { 
      title: "Student Profiles", 
      description: "Check individual progress", 
      buttonText: "Browse Students",
      href: "/teacher/profiles" 
    },
    { 
      title: "Insights & Reports", 
      description: "Analyze class performance", 
      buttonText: "View Insights",
      href: "/teacher/insights" 
    }
  ];

  // Loading state
  if (authLoading || isLoading) {
    return (
      <TeacherDashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="text-xl font-semibold">Loading Dashboard</h2>
          <p className="text-gray-500 mt-2">Preparing your teacher dashboard...</p>
        </div>
      </TeacherDashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <TeacherDashboardLayout>
        <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/login')}>Return to Login</Button>
        </div>
      </TeacherDashboardLayout>
    );
  }

  // Empty state (no classes)
  if (!isLoading && classStats.total === 0) {
    return (
      <TeacherDashboardLayout>
        <div className="p-8 text-center">
          <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Classes Available</h2>
          <p className="text-gray-600 mb-6">You don't have any active classes at the moment.</p>
          <Button onClick={() => navigate('/teacher/sets')}>Create Your First Class</Button>
        </div>
      </TeacherDashboardLayout>
    );
  }

  const dashboardContent = (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-500">Manage your classes and monitor student progress</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-sm text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Actions Cards */}
      <h2 className="text-xl font-semibold mt-8 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action) => (
          <Card key={action.title}>
            <CardHeader>
              <CardTitle>{action.title}</CardTitle>
              <CardDescription>{action.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => navigate(action.href)}>{action.buttonText}</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Debug information */}
      {import.meta.env.DEV && (
        <div className="mt-8 p-4 border border-dashed rounded-md bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Debug Information:</h3>
          <div className="text-xs text-slate-600 space-y-1">
            <div><strong>User:</strong> {user?.email || 'Not logged in'}</div>
            <div><strong>Role:</strong> {user?.role || 'Unknown'}</div>
            <div><strong>Class Count:</strong> {classStats.total}</div>
            <div><strong>Loading State:</strong> {isLoading ? 'Loading' : 'Loaded'}</div>
          </div>
        </div>
      )}
    </div>
  );

  return <TeacherDashboardLayout>{dashboardContent}</TeacherDashboardLayout>;
};

export default TeacherDashboardPage;
