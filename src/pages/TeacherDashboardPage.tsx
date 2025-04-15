
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Bell, BarChart3, FileCheck } from 'lucide-react';
import TeacherDashboardLayout from '@/components/dashboard/TeacherDashboardLayout';

const TeacherDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const { user } = state;

  // Quick stats for dashboard overview
  const stats = [
    { 
      title: "Students", 
      value: "32", 
      description: "Across 3 sets", 
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
      title: "Performance", 
      value: "+12%", 
      description: "Average improvement", 
      icon: BarChart3,
      color: "bg-purple-100 text-purple-700"
    }
  ];

  // Dashboard actions
  const actions = [
    { 
      title: "Mark Assignments", 
      description: "Review and grade student work", 
      buttonText: "Open Marking Panel",
      href: "/teacher/marking" 
    },
    { 
      title: "Create Assignment", 
      description: "Set new work for your classes", 
      buttonText: "Assign Work",
      href: "/teacher/assign" 
    },
    { 
      title: "View Student Profiles", 
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

  if (!user || user.role !== 'teacher') {
    return <div className="p-8">Access Restricted: Teacher role required</div>;
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
    </div>
  );

  return <TeacherDashboardLayout>{dashboardContent}</TeacherDashboardLayout>;
};

export default TeacherDashboardPage;
