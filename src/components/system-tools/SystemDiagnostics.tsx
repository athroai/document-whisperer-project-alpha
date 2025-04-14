
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useDatabaseStatus } from '@/contexts/DatabaseStatusContext';

const SystemDiagnostics = () => {
  const [databasePing, setDatabasePing] = useState<number | null>(null);
  const [networkLatency, setNetworkLatency] = useState<number | null>(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const { status } = useDatabaseStatus();

  useEffect(() => {
    // Check database connectivity
    const checkDatabaseConnection = async () => {
      const start = performance.now();
      try {
        const { data } = await supabase.from('profiles').select('count').limit(1);
        const end = performance.now();
        setDatabasePing(Math.round(end - start));
        setOfflineMode(false);
      } catch (error) {
        console.error('Error pinging database:', error);
        setDatabasePing(null);
        setOfflineMode(true);
      }
    };

    // Check general network latency
    const checkNetworkLatency = async () => {
      const start = performance.now();
      try {
        await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors' });
        const end = performance.now();
        setNetworkLatency(Math.round(end - start));
      } catch (error) {
        console.error('Error checking network latency:', error);
        setNetworkLatency(null);
      }
    };

    checkDatabaseConnection();
    checkNetworkLatency();

    // Set up interval to check periodically
    const interval = setInterval(() => {
      checkDatabaseConnection();
      checkNetworkLatency();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Diagnostics</CardTitle>
        <CardDescription>Real-time status of Athro AI systems</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Database Status:</span>
            <span className={`text-sm font-medium ${status === 'connected' ? 'text-green-500' : 'text-amber-500'}`}>
              {status === 'connected' ? 'Connected' : status === 'checking' ? 'Checking...' : 'Offline'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Database Latency:</span>
            <span className="text-sm font-medium">
              {databasePing ? `${databasePing}ms` : 'Unavailable'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Network Latency:</span>
            <span className="text-sm font-medium">
              {networkLatency ? `${networkLatency}ms` : 'Unavailable'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Operating Mode:</span>
            <span className={`text-sm font-medium ${offlineMode ? 'text-amber-500' : 'text-green-500'}`}>
              {offlineMode ? 'Offline' : 'Online'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemDiagnostics;
