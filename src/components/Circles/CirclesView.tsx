import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAppContext } from "@/contexts/AppContext";
import { User } from 'lucide-react';

// ✅ Define types
type Member = {
  id: string;
  name: string;
};

type Circle = {
  id: string;
  name: string;
  inviteCode: string;
  description?: string;
  members: Member[];
};

export function CirclesView() {
  // Use the correct context hook here
  const { circles, createCircle, joinCircle, user } = useAppContext();

  const [newCircleName, setNewCircleName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const handleCreateCircle = async () => {
    if (newCircleName.trim()) {
      await createCircle(newCircleName.trim());
      setNewCircleName('');
      setIsCreateModalOpen(false);
    }
  };

  const handleJoinCircle = async () => {
    if (inviteCode.trim()) {
      await joinCircle(inviteCode.trim());
      setInviteCode('');
      setIsJoinModalOpen(false);
    }
  };

  return (
    <div className="flex-1 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Your Circles</h1>
          <p className="text-sm text-muted-foreground">
            Manage your family and friend groups
          </p>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-12">
                Create Circle
              </Button>
            </DialogTrigger>
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
                  value={newCircleName}
                  onChange={(e) => setNewCircleName(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsCreateModalOpen(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCircle} className="flex-1">
                    Create
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
            <DialogTrigger asChild>
              <Button className="h-12">
                Join Circle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join Circle</DialogTitle>
                <DialogDescription>
                  Enter the invite code shared by a circle member
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Enter invite code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsJoinModalOpen(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleJoinCircle} className="flex-1">
                    Join
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Circles list */}
        {circles.length === 0 ? (
          <Card className="mt-8">
            <CardContent className="text-center py-8">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No Circles Yet</h3>
              <p className="text-sm text-muted-foreground">
                Create or join a circle to start sharing locations with your loved ones
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {circles.map((circle) => (
              <Card key={circle.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{circle.name}</CardTitle>
                    <Badge variant="secondary">
                      {circle.members.length} member{circle.members.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  {circle.description && (
                    <CardDescription>{circle.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Invite Code:</span>
                    <code className="bg-muted px-2 py-1 rounded text-xs">
                      {circle.inviteCode}
                    </code>
                  </div>
                  <div className="mt-3 flex -space-x-2">
                    {circle.members.slice(0, 5).map((member) => (
                      <div
                        key={member.id}
                        className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium border-2 border-background"
                        title={member.name}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {circle.members.length > 5 && (
                      <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs border-2 border-background">
                        +{circle.members.length - 5}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
