
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AdminSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ open, onOpenChange }) => {
  // This component is no longer intended for user-facing use
  // Since we always use the project API key now
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Admin Settings</DialogTitle>
          <DialogDescription>
            System configuration settings - admin access only.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center mb-2">
              <Shield className="h-4 w-4 mr-1 text-amber-500" />
              <Label htmlFor="adminInfo" className="text-amber-500 font-medium">Admin Only Area</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              This area is restricted to system administrators only.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminSettings;
