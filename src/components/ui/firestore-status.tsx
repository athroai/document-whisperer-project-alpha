
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CloudOff, AlertCircle, Cloud } from "lucide-react";

type FirestoreStatusType = "loading" | "connected" | "offline" | "error";

interface FirestoreStatusProps {
  status: FirestoreStatusType;
  className?: string;
  showSuccessStatus?: boolean;
  compact?: boolean;
}

export function FirestoreStatus({
  status,
  className = "",
  showSuccessStatus = false,
  compact = false
}: FirestoreStatusProps) {
  // If connected and we don't need to show success status, return null
  if (status === "connected" && !showSuccessStatus) {
    return null;
  }
  
  // For compact mode, show badges
  if (compact) {
    if (status === "offline") {
      return (
        <Badge 
          variant="outline" 
          className="bg-yellow-50 text-yellow-800 border-yellow-200 flex items-center gap-1"
        >
          <CloudOff className="h-3 w-3" /> Offline Mode
        </Badge>
      );
    }
    
    if (status === "error") {
      return (
        <Badge 
          variant="outline" 
          className="bg-red-50 text-red-800 border-red-200 flex items-center gap-1"
        >
          <AlertCircle className="h-3 w-3" /> Sync Error
        </Badge>
      );
    }
    
    if (status === "connected" && showSuccessStatus) {
      return (
        <Badge 
          variant="outline" 
          className="bg-green-50 text-green-800 border-green-200 flex items-center gap-1"
        >
          <Cloud className="h-3 w-3" /> Synced
        </Badge>
      );
    }
    
    if (status === "loading") {
      return (
        <Badge 
          variant="outline" 
          className="bg-blue-50 text-blue-800 border-blue-200 flex items-center gap-1"
        >
          <span className="h-3 w-3 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mr-1" />
          Syncing...
        </Badge>
      );
    }
    
    return null;
  }
  
  // Full alert mode
  if (status === "offline") {
    return (
      <Alert className={`mb-4 bg-yellow-50 border-yellow-200 ${className}`}>
        <CloudOff className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">Working Offline</AlertTitle>
        <AlertDescription className="text-yellow-700">
          You're currently working offline. Your session data is stored locally and will sync when connectivity is restored.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (status === "error") {
    return (
      <Alert className={`mb-4 bg-red-50 border-red-200 ${className}`}>
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Sync Error</AlertTitle>
        <AlertDescription className="text-red-700">
          We're having trouble connecting to Firestore. Your session is running in local mode only.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (status === "connected" && showSuccessStatus) {
    return (
      <Alert className={`mb-4 bg-green-50 border-green-200 ${className}`}>
        <Cloud className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Connected to Firestore</AlertTitle>
        <AlertDescription className="text-green-700">
          Your session data is being synced to the cloud. You can continue your studies on any device.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (status === "loading") {
    return (
      <Alert className={`mb-4 bg-blue-50 border-blue-200 ${className}`}>
        <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <AlertTitle className="text-blue-800">Syncing Data</AlertTitle>
        <AlertDescription className="text-blue-700">
          Connecting to Firestore and syncing your session data...
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
}

