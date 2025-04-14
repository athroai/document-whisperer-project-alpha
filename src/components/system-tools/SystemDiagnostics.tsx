
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
import { checkFirestoreConnection } from '@/config/firebase';

const SystemDiagnostics: React.FC = () => {
  const { toast } = useToast();
  const [debugMode, setDebugMode] = useState(false);
  const [useMockData, setUseMockData] = useState(false);
  const [testAIMode, setTestAIMode] = useState(false);
  const [systemInfo, setSystemInfo] = useState(() => SystemToolsService.getSystemDiagnostics());
  const [firestoreStatus, setFirestoreStatus] = useState<'loading' | 'connected' | 'offline' | 'error'>('loading');
  const [lastConnectionCheck, setLastConnectionCheck] = useState<Date | null>(null);
  
  useEffect(() => {
    // Test Firestore connection on component mount
    const testConnection = async () => {
      try {
        setFirestoreStatus('loading');
        const status = await checkFirestoreConnection();
        setFirestoreStatus(status);
        setLastConnectionCheck(new Date());
      } catch (error) {
        console.error("Error testing Firestore connection:", error);
        setFirestoreStatus(navigator.onLine ? 'error' : 'offline');
        setLastConnectionCheck(new Date());
      }
    };
    
    testConnection();
    
    // Add network status listeners for debugging
    const handleOnline = () => {
      console.log('[Network] Browser reports online status');
      toast({
        title: "Network Connected",
        description: "Your device is now online. Syncing data...",
        variant: "default"
      });
      testConnection();
    };
    
    const handleOffline = () => {
      console.log('[Network] Browser reports offline status');
      setFirestoreStatus('offline');
      setLastConnectionCheck(new Date());
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
  const refreshSystemInfo = async () => {
    setSystemInfo(SystemToolsService.getSystemDiagnostics());
    
    // Also check Firestore connection
    try {
      setFirestoreStatus('loading');
      const status = await checkFirestoreConnection();
      setFirestoreStatus(status);
      setLastConnectionCheck(new Date());
    } catch (error) {
      console.error("Error testing Firestore connection:", error);
      setFirestoreStatus(navigator.onLine ? 'error' : 'offline');
      setLastConnectionCheck(new Date());
    }
    
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
              <Badge variant={firestoreStatus === 'connected' ? 'outline' : (firestoreStatus === 'loading' ? 'secondary' : 'destructive')}>
                {firestoreStatus === 'connected' ? 'Connected' : 
                 firestoreStatus === 'loading' ? 'Checking...' : 
                 firestoreStatus === 'offline' ? 'Offline' : 'Error'}
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
            
            {lastConnectionCheck && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Last Connection Check:</span>
                <span>{lastConnectionCheck.toLocaleTimeString()}</span>
              </div>
            )}
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
              <span>{lastConnectionCheck ? lastConnectionCheck.toLocaleString() : 'Never'}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Connection Type:</span>
              <Badge variant="outline">
                {firestoreStatus === 'connected' ? 'ReadWrite' : 
                 firestoreStatus === 'offline' ? 'LocalOnly' : 'Pending'}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Data Mode:</span>
              <Badge variant={useMockData ? 'secondary' : 'outline'}>
                {useMockData ? 'Mock' : 'Live'}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Network Status:</span>
              <Badge variant={navigator.onLine ? 'outline' : 'destructive'}>
                {navigator.onLine ? 'Online' : 'Offline'}
              </Badge>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => checkFirestoreConnection().then(status => {
                setFirestoreStatus(status);
                setLastConnectionCheck(new Date());
                toast({
                  title: `Firestore Test ${status === 'connected' ? 'Successful' : 'Failed'}`,
                  description: status === 'connected' ? 
                    "Connection to Firestore is working properly" : 
                    `Connection status: ${status}`,
                  variant: "default"
                });
              })}
              className="w-full mt-2"
            >
              Test Firestore Connection
            </Button>
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
