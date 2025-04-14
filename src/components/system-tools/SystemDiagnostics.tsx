
import React, { useState, useEffect } from 'react';
import { Activity, Terminal, Database, Info } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { SystemToolsService } from '@/services/systemToolsService';
import { useToast } from '@/hooks/use-toast';

const SystemDiagnostics: React.FC = () => {
  const { toast } = useToast();
  const [debugMode, setDebugMode] = useState(false);
  const [useMockData, setUseMockData] = useState(false);
  const [testAIMode, setTestAIMode] = useState(false);
  const [systemInfo, setSystemInfo] = useState(() => SystemToolsService.getSystemDiagnostics());
  
  useEffect(() => {
    // Add network status listeners for debugging
    const handleOnline = () => {
      console.log('[Network] Browser reports online status');
      toast({
        title: "Network Connected",
        description: "Your device is now online. Syncing data...",
        variant: "default"
      });
    };
    
    const handleOffline = () => {
      console.log('[Network] Browser reports offline status');
      toast({
        title: "Network Disconnected",
        description: "Your device is offline. Working in local mode.",
        variant: "default"
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);
  
  // Enable debug mode
  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
    console.log(`Debug mode ${!debugMode ? 'enabled' : 'disabled'}`);
    toast({
      title: `Debug Mode ${!debugMode ? 'Enabled' : 'Disabled'}`,
      description: !debugMode ? 'Additional logging is now active' : 'Standard logging restored',
      variant: "default"
    });
  };
  
  // Toggle mock data
  const toggleMockData = () => {
    setUseMockData(!useMockData);
    toast({
      title: `Mock Data ${!useMockData ? 'Enabled' : 'Disabled'}`,
      description: !useMockData ? 'Using simulated data responses' : 'Using live data sources',
      variant: "default"
    });
  };
  
  // Test AI responses
  const toggleTestAI = () => {
    setTestAIMode(!testAIMode);
    toast({
      title: `AI Test Mode ${!testAIMode ? 'Enabled' : 'Disabled'}`,
      description: !testAIMode ? 'Using test data for AI responses' : 'Using standard AI behavior',
      variant: "default"
    });
  };
  
  // Refresh system status
  const refreshSystemInfo = () => {
    setSystemInfo(SystemToolsService.getSystemDiagnostics());
    toast({
      title: "System Information Updated",
      description: "Latest system status retrieved",
      variant: "default"
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-600" />
          System Diagnostics
        </CardTitle>
        <CardDescription>
          View system status and enable developer tools
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* System Status Section */}
        <div className="rounded-md border p-4 space-y-3">
          <h3 className="font-medium text-sm flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            System Status
          </h3>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Firestore Connection:</span>
              <Badge variant={systemInfo.firestoreStatus === 'connected' ? 'outline' : 'destructive'}>
                {systemInfo.firestoreStatus === 'connected' ? 'Connected' : systemInfo.firestoreStatus === 'mock' ? 'Mock Mode' : 'Disconnected'}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Environment:</span>
              <Badge variant="outline">
                {systemInfo.environment}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">System Time:</span>
              <span>{new Date(systemInfo.systemTime).toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">User Session:</span>
              <Badge variant={systemInfo.userSessionActive ? 'outline' : 'destructive'}>
                {systemInfo.userSessionActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">System Version:</span>
              <span>1.0.25-a</span>
            </div>
          </div>
        </div>
        
        {/* Developer Tools Section */}
        <div className="rounded-md border p-4 space-y-3">
          <h3 className="font-medium text-sm flex items-center gap-2">
            <Terminal className="h-4 w-4 text-green-500" />
            Developer Tools
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Debug Mode</label>
                <div className="text-xs text-muted-foreground">
                  Logs additional information to the console
                </div>
              </div>
              <Switch checked={debugMode} onCheckedChange={toggleDebugMode} />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Use Mock Data</label>
                <div className="text-xs text-muted-foreground">
                  Uses simulated data instead of firestore
                </div>
              </div>
              <Switch checked={useMockData} onCheckedChange={toggleMockData} />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Test AI Responses</label>
                <div className="text-xs text-muted-foreground">
                  Uses test data for Athro AI responses
                </div>
              </div>
              <Switch checked={testAIMode} onCheckedChange={toggleTestAI} />
            </div>
          </div>
        </div>
        
        {/* Database Section */}
        <div className="rounded-md border p-4 space-y-3">
          <h3 className="font-medium text-sm flex items-center gap-2">
            <Database className="h-4 w-4 text-amber-500" />
            Database Status
          </h3>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Last Sync:</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Connection Type:</span>
              <Badge variant="outline">ReadWrite</Badge>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Data Mode:</span>
              <Badge variant={useMockData ? 'secondary' : 'outline'}>
                {useMockData ? 'Mock' : 'Live'}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={refreshSystemInfo}
        >
          Refresh System Info
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SystemDiagnostics;
