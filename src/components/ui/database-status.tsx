
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CloudOff, AlertCircle, Cloud, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDatabaseStatus } from "@/contexts/DatabaseStatusContext";

interface DatabaseStatusProps {
  className?: string;
  showSuccessStatus?: boolean;
  compact?: boolean;
}

export function DatabaseStatus({
  className = "",
  showSuccessStatus = false,
  compact = false,
}: DatabaseStatusProps) {
  const { status, retry } = useDatabaseStatus();
  
  // If connected and we don't need to show success status, return null
  if (status === "connected" && !showSuccessStatus) {
    return null;
  }
  
  // For compact mode, show badges
  if (compact) {
    if (status === "offline") {
      return (
        <div className="flex items-center">
          <Badge 
            variant="outline" 
            className="bg-yellow-50 text-yellow-800 border-yellow-200 flex items-center gap-1"
          >
            <CloudOff className="h-3 w-3" /> Working Offline
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => retry()} 
            className="h-6 px-2 ml-1"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      );
    }
    
    if (status === "error") {
      return (
        <div className="flex items-center">
          <Badge 
            variant="outline" 
            className="bg-red-50 text-red-800 border-red-200 flex items-center gap-1"
          >
            <AlertCircle className="h-3 w-3" /> Connection Issue
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => retry()} 
            className="h-6 px-2 ml-1"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      );
    }
    
    if (status === "connected" && showSuccessStatus) {
      return (
        <Badge 
          variant="outline" 
          className="bg-green-50 text-green-800 border-green-200 flex items-center gap-1"
        >
          <Cloud className="h-3 w-3" /> Connected
        </Badge>
      );
    }
    
    if (status === "checking") {
      return (
        <Badge 
          variant="outline" 
          className="bg-blue-50 text-blue-800 border-blue-200 flex items-center gap-1"
        >
          <span className="h-3 w-3 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mr-1" />
          Connecting...
        </Badge>
      );
    }
    
    return null;
  }
  
  // Full alert mode
  if (status === "offline") {
    return (
      <Alert variant="default" className={`mb-4 bg-yellow-50 border-yellow-200 ${className}`}>
        <CloudOff className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">Working Offline</AlertTitle>
        <AlertDescription className="text-yellow-700 flex flex-col">
          <span>You're currently working offline. Your data is stored locally and will sync when connectivity is restored.</span>
          {navigator.onLine && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 self-start" 
              onClick={() => retry()}
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Retry Connection
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (status === "error") {
    return (
      <Alert variant="default" className={`mb-4 bg-red-50 border-red-200 ${className}`}>
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Connection Issue</AlertTitle>
        <AlertDescription className="text-red-700 flex flex-col">
          <span>We're having trouble connecting to our servers. Please check your connection.</span>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 self-start" 
            onClick={() => retry()}
          >
            <RefreshCw className="h-3 w-3 mr-1" /> Retry Connection
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  if (status === "connected" && showSuccessStatus) {
    return (
      <Alert variant="default" className={`mb-4 bg-green-50 border-green-200 ${className}`}>
        <Cloud className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Connected</AlertTitle>
        <AlertDescription className="text-green-700">
          Your data is being synchronized with the cloud. You can continue your studies on any device.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (status === "checking") {
    return (
      <Alert variant="default" className={`mb-4 bg-blue-50 border-blue-200 ${className}`}>
        <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <AlertTitle className="text-blue-800">Connecting</AlertTitle>
        <AlertDescription className="text-blue-700">
          Connecting to server...
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
}
