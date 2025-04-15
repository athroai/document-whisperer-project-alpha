
import React from "react";
import { useDatabaseStatus } from "@/contexts/DatabaseStatusContext";
import { Badge } from "./badge";
import { AlertCircle, CheckCircle, Clock, WifiOff } from "lucide-react";
import { Button } from "./button";

export const DatabaseStatus = () => {
  const { status, lastCheck, retry, error } = useDatabaseStatus();

  const getBadgeColor = () => {
    switch (status) {
      case 'connected':
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case 'checking':
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case 'offline':
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case 'timeout':
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      case 'error':
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4" />;
      case 'checking':
        return <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>;
      case 'offline':
        return <WifiOff className="h-4 w-4" />;
      case 'timeout':
        return <Clock className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return "Connected";
      case 'checking':
        return "Checking";
      case 'offline':
        return "Offline";
      case 'timeout':
        return "Timeout";
      case 'error':
        return "Error";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center space-x-2">
        <Badge
          variant="outline"
          className={`cursor-default flex items-center space-x-1 ${getBadgeColor()}`}
        >
          {getStatusIcon()}
          <span>{getStatusText()}</span>
        </Badge>
        
        {status !== 'connected' && status !== 'checking' && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => retry()}
            className="h-7 px-2"
          >
            Retry
          </Button>
        )}
      </div>
      
      {status === 'error' && error && (
        <p className="text-xs text-red-600 mt-1">{error.message}</p>
      )}
      
      {status !== 'checking' && lastCheck && (
        <p className="text-xs text-gray-500 mt-1">
          Last check: {lastCheck.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};
