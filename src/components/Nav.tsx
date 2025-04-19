import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const Nav: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch, login, signup } = useAuth();
  const { error } = useToast();
  
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  const handleLogin = async () => {
    try {
      await login(loginEmail, loginPassword);
      setIsLoginOpen(false);
      navigate('/chat');
    } catch (e: any) {
      error({
        title: "Authentication Failed",
        description: e.message || "Invalid credentials. Please try again.",
      });
    }
  };

  const handleSignup = async () => {
    try {
      await signup(signupEmail, signupPassword, signupName);
      setIsSignupOpen(false);
      navigate('/chat');
    } catch (e: any) {
      error({
        title: "Signup Failed",
        description: e.message || "Could not create account. Please try again.",
      });
    }
  };

  return (
    <header className="fixed top-0 w-full bg-background z-50 border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-xl font-bold text-foreground">
            <span className="text-primary">Athro</span>AI
          </Link>
          {state.isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-4">
              <Link 
                to="/chat" 
                className="text-foreground hover:text-primary transition-colors"
              >
                Chat
              </Link>
              <Link 
                to="/calendar" 
                className="text-foreground hover:text-primary transition-colors"
              >
                Calendar
              </Link>
              <Link 
                to="/chat-onboarding" 
                className="text-foreground hover:text-primary transition-colors"
              >
                Onboarding
              </Link>
            </nav>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {!state.isAuthenticated ? (
            <>
              <Button variant="outline" onClick={() => setIsLoginOpen(true)}>
                Login
              </Button>
              <Button onClick={() => setIsSignupOpen(true)}>Sign Up</Button>
            </>
          ) : (
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </div>
      </div>
      
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Login</DialogTitle>
            <DialogDescription>
              Enter your email and password to access your account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input 
                type="email" 
                id="email" 
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">Password</Label>
              <Input 
                type="password" 
                id="password" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="col-span-3" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleLogin}>Login</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSignupOpen} onOpenChange={setIsSignupOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sign Up</DialogTitle>
            <DialogDescription>
              Create a new account by entering your details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input 
                type="text" 
                id="name" 
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input 
                type="email" 
                id="email" 
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">Password</Label>
              <Input 
                type="password" 
                id="password" 
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="col-span-3" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSignup}>Sign Up</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Nav;
