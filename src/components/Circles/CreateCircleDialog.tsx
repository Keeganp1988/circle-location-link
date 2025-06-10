import React, { useState } from "react";
import { useApp } from '@/contexts/AppContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateCircleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCircleDialog({ open, onOpenChange }: CreateCircleDialogProps) {
  const { createCircle } = useApp();
  const [circleName, setCircleName] = useState("");

  const handleCreate = async () => {
    if (circleName.trim()) {
      const success = await createCircle(circleName.trim());
      if (success) {
        setCircleName("");
        onOpenChange(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Circle</DialogTitle>
          <DialogDescription>
            Create a new circle for your family or friends
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Circle name (e.g., 'Family', 'Work Team')"
            value={circleName}
            onChange={(e) => setCircleName(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} className="flex-1">
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 