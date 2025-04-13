
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, RefreshCcw, CheckCircle, RefreshCw, SendHorizonal, Trash2, Activity } from 'lucide-react';

import QuickClassReset from '@/components/system-tools/QuickClassReset';
import MarkAllPresent from '@/components/system-tools/MarkAllPresent';
import ClassSyncCheck from '@/components/system-tools/ClassSyncCheck';
import MassAssignTask from '@/components/system-tools/MassAssignTask';
import ClassCleanupUtility from '@/components/system-tools/ClassCleanupUtility';
import SystemDiagnostics from '@/components/system-tools/SystemDiagnostics';

const TeacherSystemToolsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('quick-class-reset');
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wrench className="h-6 w-6 text-purple-600" />
          System Tools
        </h1>
        <p className="text-gray-500 mt-1">
          Advanced utilities to manage your classes, students, and system settings.
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2">
          <TabsTrigger value="quick-class-reset" className="flex items-center gap-1">
            <RefreshCcw className="h-4 w-4" />
            <span className="hidden md:inline">Quick Reset</span>
            <span className="inline md:hidden">Reset</span>
          </TabsTrigger>
          <TabsTrigger value="mark-all-present" className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            <span className="hidden md:inline">Mark Present</span>
            <span className="inline md:hidden">Present</span>
          </TabsTrigger>
          <TabsTrigger value="class-sync" className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden md:inline">Sync Check</span>
            <span className="inline md:hidden">Sync</span>
          </TabsTrigger>
          <TabsTrigger value="mass-assign" className="flex items-center gap-1">
            <SendHorizonal className="h-4 w-4" />
            <span className="hidden md:inline">Mass Assign</span>
            <span className="inline md:hidden">Assign</span>
          </TabsTrigger>
          <TabsTrigger value="cleanup" className="flex items-center gap-1">
            <Trash2 className="h-4 w-4" />
            <span className="hidden md:inline">Cleanup</span>
            <span className="inline md:hidden">Clean</span>
          </TabsTrigger>
          <TabsTrigger value="diagnostics" className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            <span className="hidden md:inline">Diagnostics</span>
            <span className="inline md:hidden">Status</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="quick-class-reset" className="mt-0">
            <QuickClassReset />
          </TabsContent>
          
          <TabsContent value="mark-all-present" className="mt-0">
            <MarkAllPresent />
          </TabsContent>
          
          <TabsContent value="class-sync" className="mt-0">
            <ClassSyncCheck />
          </TabsContent>
          
          <TabsContent value="mass-assign" className="mt-0">
            <MassAssignTask />
          </TabsContent>
          
          <TabsContent value="cleanup" className="mt-0">
            <ClassCleanupUtility />
          </TabsContent>
          
          <TabsContent value="diagnostics" className="mt-0">
            <SystemDiagnostics />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default TeacherSystemToolsPage;
