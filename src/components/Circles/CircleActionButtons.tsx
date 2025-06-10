import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus } from "lucide-react";

export function CircleActionButtons() {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-16 left-0 right-0 p-4 border-t bg-background">
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => navigate('/join')}
          variant="outline"
          size="sm"
          className="w-32"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Join
        </Button>
        <Button
          onClick={() => navigate('/create')}
          size="sm"
          className="w-32"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create
        </Button>
      </div>
    </div>
  );
} 