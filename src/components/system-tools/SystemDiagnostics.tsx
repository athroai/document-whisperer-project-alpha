
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Database, Loader2, RefreshCw, Server, Wifi, WifiOff } from 'lucide-react';
import { useFirestoreStatus } from '@/contexts/FirestoreStatusContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SystemDiagnostics: React.FC = () => {
  const { status: dbStatus, retry: checkDbConnection } = useFirestoreStatus();
  const { toast } = useToast();
  const [checking, setChecking] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [storageStatus, setStorageStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [networkLatency, setNetworkLatency] = useState<number | null>(null);

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    setChecking(true);
    checkNetworkLatency();
    await Promise.all([
      checkApiStatus(),
      checkStorageStatus(),
      checkDbConnection()
    ]);
    setChecking(false);

    toast({
      title: "System Check Complete",
      description: "System diagnostics have been updated."
    });
  };

  const checkApiStatus = async () => {
    setApiStatus('checking');
    try {
      // Simple test to check if Supabase functions are accessible
      const startTime = Date.now();
      const { data } = await supabase.from('profiles').select('count').limit(1);
      const endTime = Date.now();
      setNetworkLatency(endTime - startTime);
      
      setApiStatus(data ? 'online' : 'offline');
    } catch (error) {
      console.error("API check error:", error);
      setApiStatus('offline');
    }
  };

  const checkStorageStatus = async () => {
    setStorageStatus('checking');
    try {
      // Test if storage is accessible
      const { data } = await supabase.storage.getBucket('student_uploads');
      setStorageStatus(data ? 'online' : 'offline');
    } catch (error) {
      console.error("Storage check error:", error);
      setStorageStatus('offline');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Server className="mr-2 h-5 w-5" /> System Diagnostics
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-auto"
            onClick={checkSystemStatus}
            disabled={checking}
          >
            {checking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Status
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 border rounded-md">
            <div className="flex items-center">
              <Wifi className="h-5 w-5 mr-2 text-gray-500" />
              <span>Network Status</span>
            </div>
            {isOnline ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Online
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Offline
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-md">
            <div className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-gray-500" />
              <span>Database Connection</span>
            </div>
            {dbStatus === 'checking' ? (
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                Checking...
              </Badge>
            ) : dbStatus === 'connected' ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                {dbStatus === 'offline' ? 'Offline' : 'Error'}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-md">
            <div className="flex items-center">
              <Server className="h-5 w-5 mr-2 text-gray-500" />
              <span>API Services</span>
            </div>
            {apiStatus === 'checking' ? (
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                Checking...
              </Badge>
            ) : apiStatus === 'online' ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Online
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Offline
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-md">
            <div className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-gray-500" />
              <span>Storage Services</span>
            </div>
            {storageStatus === 'checking' ? (
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                Checking...
              </Badge>
            ) : storageStatus === 'online' ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Online
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Offline
              </Badge>
            )}
          </div>
        </div>
        
        <div className="p-4 border rounded-md">
          <h3 className="text-sm font-medium mb-2">Network Latency</h3>
          <div className="flex items-center">
            {networkLatency === null ? (
              <span className="text-gray-500">Not measured</span>
            ) : networkLatency < 300 ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="font-medium">{networkLatency}ms</span>
                <span className="text-sm text-gray-500 ml-2">(Good)</span>
              </>
            ) : networkLatency < 1000 ? (
              <>
                <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                <span className="font-medium">{networkLatency}ms</span>
                <span className="text-sm text-gray-500 ml-2">(Moderate)</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500 mr-2" />
                <span className="font-medium">{networkLatency}ms</span>
                <span className="text-sm text-gray-500 ml-2">(Poor)</span>
              </>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="current">
          <TabsList className="mb-2">
            <TabsTrigger value="current">Current Session</TabsTrigger>
            <TabsTrigger value="system">System Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current" className="space-y-4">
            <div className="text-sm space-y-2">
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Browser</span>
                <span>{typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Language</span>
                <span>{typeof navigator !== 'undefined' ? navigator.language : 'Unknown'}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Screen Resolution</span>
                <span>
                  {typeof window !== 'undefined' 
                    ? `${window.screen.width}x${window.screen.height}` 
                    : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Database Connection</span>
                <span>{dbStatus}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">API Status</span>
                <span>{apiStatus}</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="system">
            <div className="text-sm space-y-2">
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Database Provider</span>
                <span>Supabase</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Storage Provider</span>
                <span>Supabase Storage</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Authentication</span>
                <span>Supabase Auth</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Environment</span>
                <span>{import.meta.env.MODE || 'development'}</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SystemDiagnostics;
