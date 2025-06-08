
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApp } from '@/contexts/AppContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function SOSButton() {
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { sendCheckIn, currentLocation } = useApp();

  const handleSOSPress = () => {
    setShowConfirmDialog(true);
  };

  const confirmSOS = async () => {
    setShowConfirmDialog(false);
    setIsSOSActive(true);
    
    await sendCheckIn('sos', 'Emergency alert triggered');
    
    // Simulate SOS active state for 30 seconds
    setTimeout(() => {
      setIsSOSActive(false);
    }, 30000);
  };

  const cancelSOS = () => {
    setIsSOSActive(false);
    sendCheckIn('safe', 'False alarm - I am safe');
  };

  if (isSOSActive) {
    return (
      <div className="fixed inset-0 bg-red-500 bg-opacity-95 flex flex-col items-center justify-center z-50 p-4">
        <div className="text-center text-white mb-8">
          <h1 className="text-4xl font-bold mb-2">SOS ACTIVE</h1>
          <p className="text-xl">Emergency contacts have been notified</p>
          <p className="text-lg mt-2">Your location is being shared</p>
        </div>
        
        <div className="space-y-4 w-full max-w-xs">
          <Button 
            onClick={cancelSOS}
            className="w-full h-14 text-lg bg-white text-red-500 hover:bg-red-50"
          >
            Cancel SOS - I'm Safe
          </Button>
          
          <Alert className="bg-red-600 border-red-700 text-white">
            <AlertDescription>
              Emergency services will be contacted if SOS remains active
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed bottom-20 right-4 z-40">
        <Button
          onClick={handleSOSPress}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg border-4 border-white"
          size="sm"
        >
          SOS
        </Button>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Emergency Alert</DialogTitle>
            <DialogDescription>
              This will immediately notify your emergency contacts and share your current location.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {!currentLocation && (
              <Alert>
                <AlertDescription>
                  Location services are not enabled. Your contacts will be notified but location won't be shared.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowConfirmDialog(false)}
                variant="outline" 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmSOS}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                Send SOS
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
