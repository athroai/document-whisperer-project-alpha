
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AdminSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ open, onOpenChange }) => {
  const [apiKey, setApiKey] = useState('');
  
  useEffect(() => {
    // Load saved API key if exists
    const savedKey = localStorage.getItem('athro_admin_openai_key') || '';
    setApiKey(savedKey);
  }, [open]);

  const handleSaveApiKey = () => {
    if (apiKey && apiKey.trim()) {
      localStorage.setItem('athro_admin_openai_key', apiKey.trim());
      toast({
        title: "API Key Saved",
        description: "The OpenAI API key has been saved for all users.",
      });
    } else {
      localStorage.removeItem('athro_admin_openai_key');
      toast({
        title: "API Key Removed",
        description: "Users will need to provide their own API keys.",
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Admin Settings</DialogTitle>
          <DialogDescription>
            Configure system-wide settings for all users.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center mb-2">
              <Shield className="h-4 w-4 mr-1 text-amber-500" />
              <Label htmlFor="apiKey" className="text-amber-500 font-medium">Admin Area</Label>
            </div>
            <Label htmlFor="apiKey" className="font-medium">OpenAI API Key (For All Users)</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              This key will be used for all users of the application. Leave blank to require individual API keys.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSaveApiKey}>
            <Key className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminSettings;
