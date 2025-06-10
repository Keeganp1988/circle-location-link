import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation } from "lucide-react";
import type { UserLocation } from "@/types";

interface UserLocationInfoProps {
  userLocation: UserLocation;
}

export function UserLocationInfo({ userLocation }: UserLocationInfoProps) {
  const isMoving = userLocation.location.speed && userLocation.location.speed > 1; // Consider moving if speed > 1 m/s

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${userLocation.user.name}`} />
          <AvatarFallback>{userLocation.user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{userLocation.user.name}</h3>
            <Badge variant={isMoving ? "default" : "secondary"}>
              {isMoving ? (
                <Navigation className="h-3 w-3 mr-1" />
              ) : (
                <MapPin className="h-3 w-3 mr-1" />
              )}
              {isMoving ? "Moving" : "Stationary"}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Location: {userLocation.location.address || "Unknown location"}</p>
            {userLocation.location.speed && (
              <p>Speed: {Math.round(userLocation.location.speed * 3.6)} km/h</p>
            )}
            <p className="text-xs mt-1">
              Last updated: {new Date(userLocation.location.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
} 