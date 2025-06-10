import React from 'react';
import { Member, Location, MovementStatus } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Avatar,
  Chip,
  Stack
} from '@mui/material';
import {
  DirectionsWalk,
  DirectionsCar,
  AccessTime,
  LocationOn
} from '@mui/icons-material';

interface MemberDetailsProps {
  member: Member;
  location?: Location;
}

const getMovementIcon = (status: MovementStatus) => {
  switch (status) {
    case 'walking':
      return <DirectionsWalk />;
    case 'driving':
      return <DirectionsCar />;
    default:
      return <AccessTime />;
  }
};

const getMovementColor = (status: MovementStatus) => {
  switch (status) {
    case 'walking':
      return 'primary';
    case 'driving':
      return 'secondary';
    default:
      return 'default';
  }
};

export const MemberDetails: React.FC<MemberDetailsProps> = ({ member, location }) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            alt={member.name}
            sx={{ width: 56, height: 56, mr: 2 }}
          />
          <Box>
            <Typography variant="h6">{member.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {location ? 'Online' : 'Offline'}
            </Typography>
          </Box>
        </Box>

        {location && (
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">
                {location.address || 'Location not available'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {getMovementIcon(location.movementStatus)}
              <Chip
                label={location.movementStatus}
                color={getMovementColor(location.movementStatus)}
                size="small"
                sx={{ ml: 1 }}
              />
              {location.speed && (
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {Math.round(location.speed * 3.6)} km/h
                </Typography>
              )}
            </Box>

            <Typography variant="caption" color="text.secondary">
              Updated {formatDistanceToNow(location.timestamp)} ago
            </Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}; 