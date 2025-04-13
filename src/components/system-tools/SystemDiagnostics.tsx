
import React, { useState, useEffect } from 'react';
import { Activity, Server, Clock, Database } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SystemToolsService } from '@/services/systemToolsService';

const SystemDiagnostics: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState({
    firestoreStatus: 'disconnected' as 'connected' | 'disconnected' | 'mock',
    environment: 'development' as 'development' | 'production',
    systemTime: '',
    userSessionActive: false
  });
  const [currentTime, setCurrentTime] = useState('');
  
  // Get initial system info
  useEffect(() => {
    const info = SystemToolsService.getSystemDiagnostics();
    setSystemInfo(info);
    
    // Update time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-500';
      case 'mock':
        return 'text-amber-500';
      default:
        return 'text-red-500';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-600" />
          System Diagnostics
        </CardTitle>
        <CardDescription>
          Current status and health of the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1 p-3 bg-gray-50 rounded-md">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Database className="h-4 w-4" />
              Firestore Status
            </div>
            <div className={`text-lg font-semibold ${getStatusColor(systemInfo.firestoreStatus)}`}>
              {systemInfo.firestoreStatus.charAt(0).toUpperCase() + systemInfo.firestoreStatus.slice(1)}
              {systemInfo.firestoreStatus === 'mock' && ' (Using mock data)'}
            </div>
          </div>
          
          <div className="space-y-1 p-3 bg-gray-50 rounded-md">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Server className="h-4 w-4" />
              Environment
            </div>
            <div className="text-lg font-semibold">
              {systemInfo.environment.charAt(0).toUpperCase() + systemInfo.environment.slice(1)}
            </div>
          </div>
          
          <div className="space-y-1 p-3 bg-gray-50 rounded-md">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              System Time
            </div>
            <div className="text-lg font-semibold">
              {currentTime}
            </div>
          </div>
          
          <div className="space-y-1 p-3 bg-gray-50 rounded-md">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Activity className="h-4 w-4" />
              User Session
            </div>
            <div className={`text-lg font-semibold ${systemInfo.userSessionActive ? 'text-green-500' : 'text-red-500'}`}>
              {systemInfo.userSessionActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemDiagnostics;
