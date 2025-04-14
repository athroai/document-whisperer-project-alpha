
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useAuth();
  const { user } = state;

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const goBack = () => {
    navigate(-1);
  };

  // Determine the appropriate home page based on user role
  const getHomePage = () => {
    if (!user) return "/login";
    if (user.role === "teacher" || user.role === "admin") return "/teacher";
    return "/athro/select";
  };

  const getErrorMessage = () => {
    if (!user) {
      return "You need to be logged in to access this page.";
    }
    
    // Check for potential permission issues based on URL and role
    if (location.pathname.startsWith('/teacher') && user.role === 'student') {
      return "You don't have permission to access teacher pages.";
    }
    
    return "We couldn't find the page you're looking for. The page might have been removed, renamed, or is temporarily unavailable.";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full text-center">
        <div className="rounded-full bg-red-100 p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-4xl font-bold mb-2 text-gray-900">
          {!user ? "401" : "404"}
        </h1>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {!user ? "Unauthorized Access" : "Page Not Found"}
        </h2>
        <p className="text-gray-600 mb-6">
          {getErrorMessage()}
        </p>
        <div className="space-y-3">
          <Button onClick={goBack} variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
          <Link to={getHomePage()}>
            <Button className="w-full">
              {!user ? "Log In" : "Return to Dashboard"}
            </Button>
          </Link>
          {user && user.role === "student" && (
            <Link to="/athro/select">
              <Button variant="outline" className="w-full">
                Go to Subject Selection
              </Button>
            </Link>
          )}
        </div>
        
        {/* Debug info only in development mode */}
        {import.meta.env.DEV && (
          <div className="mt-8 p-4 text-left border border-dashed rounded-md bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Debug Information:</h3>
            <div className="text-xs text-slate-600 space-y-1">
              <div><strong>Attempted Path:</strong> {location.pathname}</div>
              <div><strong>User:</strong> {user?.email || 'Not logged in'}</div>
              <div><strong>Role:</strong> {user?.role || 'Unknown'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotFound;
