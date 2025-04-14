
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { FirestoreStatus } from '@/components/ui/firestore-status';
import AthroSessionFirestoreService from '@/services/firestore/athroSessionService';
import { getAthroBySubject } from '@/config/athrosConfig';
import { Button } from '@/components/ui/button';
import { Clock, User, BookOpen, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import persistentStorage from '@/services/persistentStorage';
import { useFirestoreConnection } from '@/hooks/useFirestoreConnection';

interface SessionHistoryItem {
  subject: string;
  lastUsed: Date;
  avatarUrl?: string;
  id?: string;
}

const AthroProfile = () => {
  const { state } = useAuth();
  const navigate = useNavigate();
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryItem[]>([]);
  const { status: firestoreStatus, lastCheck: lastSuccessfulSync, handleRetry } = useFirestoreConnection();
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchSessionHistory = async () => {
      if (!state.user?.id) {
        return;
      }
      
      try {
        try {
          const cachedSessionsResult = await persistentStorage.getChatHistory(state.user.id);
          if (cachedSessionsResult.success && cachedSessionsResult.data) {
            console.log("Using cached session data while fetching from network");
            const cachedSessions = cachedSessionsResult.data;
            if (Array.isArray(cachedSessions)) {
              if (isMounted) {
                setSessionHistory(cachedSessions as SessionHistoryItem[]);
              }
            }
          }
        } catch (cacheError) {
          console.warn("Could not retrieve cached sessions:", cacheError);
        }
        
        // Only try to fetch from network if we are online
        if (navigator.onLine && firestoreStatus !== 'error' && firestoreStatus !== 'offline') {
          const sessions = await AthroSessionFirestoreService.getUserSessions(state.user.id);
          
          if (!isMounted) return;
          
          const enhancedSessions = sessions.map(session => {
            const athroCharacter = getAthroBySubject(session.subject);
            return {
              id: session.id,
              subject: session.subject,
              avatarUrl: athroCharacter?.avatarUrl,
              lastUsed: new Date(session.createdAt)
            };
          });
          
          if (isMounted) {
            setSessionHistory(enhancedSessions);
            
            try {
              await persistentStorage.saveChatHistory(state.user.id, enhancedSessions);
            } catch (storageError) {
              console.warn("Failed to cache sessions:", storageError);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching session history:", error);
        if (isMounted) {
          try {
            const cachedSessionsResult = await persistentStorage.getChatHistory(state.user.id);
            if (cachedSessionsResult.success && cachedSessionsResult.data) {
              setSessionHistory(cachedSessionsResult.data as SessionHistoryItem[]);
            }
          } catch (cacheError) {
            console.warn("Could not retrieve cached sessions after network error:", cacheError);
          }
        }
      }
    };
    
    // Call fetch sessions when component mounts or when firestore status changes
    fetchSessionHistory();
    
    return () => {
      isMounted = false;
    };
  }, [state.user?.id, firestoreStatus]);
  
  const handleNavigateToSubject = (subject: string) => {
    const lowerSubject = subject.toLowerCase();
    navigate(`/athro/${lowerSubject}`);
  };
  
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Student Profile</span>
            {state.user?.examBoard && state.user.examBoard !== 'none' && (
              <Badge variant="outline">{state.user.examBoard.toUpperCase()}</Badge>
            )}
          </CardTitle>
          <CardDescription>Your AthroAI study profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={null} alt={state.user?.displayName} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {state.user?.displayName?.charAt(0) || 'S'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{state.user?.displayName || 'Student'}</h3>
              <p className="text-sm text-muted-foreground">{state.user?.role || 'Student'}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <FirestoreStatus 
              status={firestoreStatus} 
              onRetry={handleRetry}
            />
            {firestoreStatus === 'connected' && lastSuccessfulSync && (
              <p className="text-xs text-muted-foreground mt-1">
                Last synced: {formatTimeAgo(lastSuccessfulSync)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="h-5 w-5 mr-2" />
            <span>Recent Study Sessions</span>
          </CardTitle>
          <CardDescription>Continue your study journey</CardDescription>
        </CardHeader>
        <CardContent>
          {firestoreStatus === 'loading' && sessionHistory.length === 0 ? (
            <div className="py-4 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading your sessions...</p>
            </div>
          ) : sessionHistory.length > 0 ? (
            <div className="space-y-3">
              {sessionHistory.map((session, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.avatarUrl} alt={session.subject} />
                      <AvatarFallback>{session.subject.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{session.subject}</h4>
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimeAgo(session.lastUsed)}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleNavigateToSubject(session.subject)}
                  >
                    <BookOpen className="h-4 w-4 mr-1" />
                    Continue
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <User className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <h3 className="font-medium">No Study History Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Start studying with any Athro to begin recording your progress</p>
              <Button onClick={() => navigate('/athro')}>
                Choose a Subject
              </Button>
            </div>
          )}
          
          {(firestoreStatus === 'offline' || firestoreStatus === 'error') && sessionHistory.length > 0 && (
            <div className="mt-4 text-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRetry}
                className="flex items-center"
              >
                <span className="mr-2">Sync Sessions</span>
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                {firestoreStatus === 'offline' 
                  ? "You're currently viewing locally saved sessions" 
                  : "Using cached sessions due to connection issues"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AthroProfile;
