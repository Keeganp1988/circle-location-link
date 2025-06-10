import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider } from '@mui/material';
import { useApp } from '../../contexts/AppContext';
import { Member, Location, UserLocation } from '../../types';
import { MapView } from '../Map/MapView';
import { MemberDetails } from './MemberDetails';

interface CirclesViewProps {
  onMemberClick?: (memberId: string) => void;
}

export const CirclesView: React.FC<CirclesViewProps> = ({ onMemberClick }) => {
  const { user, selectedCircle, circles, userLocations } = useApp();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [circleMembers, setCircleMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (selectedCircle) {
      // Filter out the current user from the members list
      const members = selectedCircle.members.filter(member => member.id !== user?.id);
      setCircleMembers(members);
    }
  }, [selectedCircle, user]);

  const handleMemberClick = (member: Member) => {
    setSelectedMember(member);
    onMemberClick?.(member.id);
  };

  const getMemberLocation = (memberId: string): Location | undefined => {
    return userLocations.find(loc => loc.userId === memberId)?.location;
  };

  if (!selectedCircle) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Select a circle to view members</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {selectedMember ? (
        <>
          <MemberDetails 
            member={selectedMember} 
            location={getMemberLocation(selectedMember.id)} 
          />
          
          <Box sx={{ flex: 1, minHeight: '300px', mb: 2 }}>
            <MapView
              center={getMemberLocation(selectedMember.id)}
              markers={[
                {
                  position: getMemberLocation(selectedMember.id),
                  title: selectedMember.name,
                  movementStatus: getMemberLocation(selectedMember.id)?.movementStatus
                }
              ]}
            />
          </Box>

          <Typography variant="h6" sx={{ px: 2, mb: 1 }}>
            Other Members
          </Typography>
        </>
      ) : (
        <Typography variant="h6" sx={{ px: 2, mb: 1 }}>
          Circle Members
        </Typography>
      )}

      <List sx={{ flex: 1, overflow: 'auto' }}>
        {circleMembers.map((member) => (
          <React.Fragment key={member.id}>
            <ListItem 
              onClick={() => handleMemberClick(member)}
              sx={{ 
                cursor: 'pointer',
                bgcolor: selectedMember?.id === member.id ? 'action.selected' : 'inherit'
              }}
            >
              <ListItemAvatar>
                <Avatar alt={member.name} />
              </ListItemAvatar>
              <ListItemText
                primary={member.name}
                secondary={getMemberLocation(member.id) ? 'Online' : 'Offline'}
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};
