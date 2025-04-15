
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useDatabaseStatus } from '@/contexts/DatabaseStatusContext';
import { DatabaseStatus } from '@/components/ui/database-status';
import { testSupabaseConnection } from '@/services/connectionTest';
import { AlertCircle, RefreshCw, Wifi, WifiOff, Clock } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionResults, setConnectionResults] = useState<any>(null);
  const { login, state } = useAuth();
  const navigate = useNavigate();
  const { status: connectionStatus, retry: retryConnection, error: connectionError } = useDatabaseStatus();

  // Redirect if already logged in
  useEffect(() => {
    if (state.user && !state.loading) {
      navigate('/home');
    }
  }, [state.user, state.loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Don't attempt to login if offline
    if (connectionStatus === 'offline') {
      toast({
        title: "You're Offline",
        description: "Please check your internet connection and try again",
        variant: "destructive"
      });
      return;
    }

    // Don't attempt to login if there's a connection error
    if (connectionStatus === 'error' || connectionStatus === 'timeout') {
      toast({
        title: connectionStatus === 'timeout' ? "Connection Timeout" : "Connection Issue",
        description: connectionStatus === 'timeout' 
          ? "Connection to authentication service timed out. Please try again later."
          : "Can't connect to authentication service. Please try again later.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      await login(email, password);
      toast({
        title: "Login successful!",
        description: "Welcome back to Athro AI",
        variant: "success"
      });
      navigate('/home');
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionResults(null);
    try {
      // Use the improved connection test
      const result = await testSupabaseConnection(20000);
      setConnectionResults(result);
      
      if (result.success) {
        toast({
          title: "Connection Test Successful",
          description: `Successfully connected to Supabase (${result.duration || 0}ms)`,
          variant: "success"
        });
        // Manually update the database status
        await retryConnection();
      } else {
        const statusMessages = {
          'offline': "You are currently offline",
          'timeout': "Connection timed out after 20 seconds",
          'error': result.error?.message || "Could not connect to database"
        };
        
        toast({
          title: "Connection Test Failed",
          description: statusMessages[result.status as keyof typeof statusMessages] || "Connection test failed",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Connection test threw an exception:", error);
      setConnectionResults({ success: false, error });
      toast({
        title: "Connection Test Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Show loading while checking auth state
  if (state.loading && !isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-100 to-white">
        <div className="text-center">
          <LoadingSpinner className="mx-auto" />
          <p className="mt-4 text-purple-800">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-100 to-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/">
          <img
            src="/lovable-uploads/40369f55-a9f5-48fb-bcf9-fdf91c946daa.png"
            alt="Athro Logo"
            className="h-24 mx-auto"
          />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-purple-800">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Log in to continue your GCSE studies with your Athro mentor
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Connection Status Section */}
          {connectionStatus === 'checking' ? (
            <div className="flex items-center justify-center p-4 mb-4 bg-blue-50 text-blue-700 rounded-md">
              <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mr-2"></div>
              <span>Checking connection status...</span>
            </div>
          ) : connectionStatus === 'offline' ? (
            <div className="p-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center">
                <WifiOff className="h-5 w-5 text-yellow-500 mr-2" />
                <h3 className="font-medium text-yellow-800">You're offline</h3>
              </div>
              <p className="mt-1 text-sm text-yellow-700">
                Please check your internet connection and try again.
              </p>
              <Button 
                onClick={handleTestConnection} 
                disabled={isTestingConnection}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                {isTestingConnection ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    <span>Testing connection...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    <span>Test Connection</span>
                  </>
                )}
              </Button>
            </div>
          ) : connectionStatus === 'timeout' ? (
            <div className="p-4 mb-4 bg-orange-50 border border-orange-200 rounded-md">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-orange-500 mr-2" />
                <h3 className="font-medium text-orange-800">Connection Timeout</h3>
              </div>
              <p className="mt-1 text-sm text-orange-700">
                Connection to the database timed out. This may be due to network issues.
              </p>
              <Button 
                onClick={handleTestConnection} 
                disabled={isTestingConnection}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                {isTestingConnection ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    <span>Testing connection...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    <span>Test Connection</span>
                  </>
                )}
              </Button>
            </div>
          ) : connectionStatus === 'error' ? (
            <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <h3 className="font-medium text-red-800">Database Unreachable</h3>
              </div>
              <p className="mt-1 text-sm text-red-700">
                {connectionError ? connectionError.message : "Unable to connect to the database."}
              </p>
              <div className="flex flex-col mt-2 space-y-2">
                <Button 
                  onClick={handleTestConnection} 
                  disabled={isTestingConnection}
                  variant="outline"
                  size="sm"
                >
                  {isTestingConnection ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      <span>Testing connection...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      <span>Test Connection</span>
                    </>
                  )}
                </Button>
              </div>
              
              {/* Show detailed connection test results if available */}
              {connectionResults && !connectionResults.success && (
                <div className="mt-3 text-xs p-2 bg-red-100 rounded overflow-auto max-h-32">
                  <p className="font-semibold">Diagnostic Information:</p>
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(connectionResults.error || {}, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : null}

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                disabled={isSubmitting || connectionStatus !== 'connected'}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                disabled={isSubmitting || connectionStatus !== 'connected'}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox 
                  id="remember-me" 
                  checked={rememberMe} 
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  disabled={isSubmitting || connectionStatus !== 'connected'}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-purple-600 hover:text-purple-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={
                  isSubmitting || 
                  connectionStatus !== 'connected'
                }
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    <span>Logging in...</span>
                  </span>
                ) : "Log in"}
              </Button>
            </div>
          </form>

          {state.error && (
            <div className="mt-4 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
              {state.error}
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  New to Athro?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link to="/signup">
                <Button
                  variant="outline"
                  className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  Create an account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
