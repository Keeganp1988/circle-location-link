import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function SOSButton() {
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const { sendCheckIn, currentLocation } = useAppContext();

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (showCountdown && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else if (showCountdown && countdown === 0) {
      triggerSOS();
    }

    return () => clearTimeout(timer);
  }, [showCountdown, countdown]);

  const handleSOSPress = () => {
    setCountdown(10);
    setShowCountdown(true);
  };

  const cancelCountdown = () => {
    setShowCountdown(false);
    setCountdown(10);
    sendCheckIn('safe', 'False alarm - I am safe');
  };

  const triggerSOS = async () => {
    setShowCountdown(false);
    setIsSOSActive(true);
    await sendCheckIn('sos', 'Emergency alert triggered');

    // Auto-hide SOS screen after 30s
    setTimeout(() => {
      setIsSOSActive(false);
    }, 30000);
  };

  const cancelSOS = () => {
    setIsSOSActive(false);
    sendCheckIn('safe', 'False alarm - I am safe');
  };

  // ------------------
  // Render: SOS Active Screen
  if (isSOSActive) {
    return (
      <div className="fixed inset-0 bg-red-500 bg-opacity-95 flex flex-col items-center justify-center z-50 p-4">
        <div className="text-center text-white mb-8">
          <h1 className="text-4xl font-bold mb-2">SOS ACTIVE</h1>
          <p className="text-xl">Emergency contacts have been notified</p>
          <p className="text-lg mt-2">Your location is being shared</p>
        </div>

        <div className="space-y-4 w-full max-w-xs">
          {/* Call Emergency Services button first */}
          <Button 
            asChild 
            className="w-full h-14 text-lg bg-red-700 hover:bg-red-800 text-white"
          >
            <a href="tel:112">
              Call Emergency Services (112)
            </a>
          </Button>

          {/* Cancel SOS button second */}
          <Button 
            onClick={cancelSOS}
            className="w-full h-14 text-lg bg-white text-red-500 hover:bg-red-50"
          >
            Cancel SOS - I'm Safe
          </Button>

          <Alert className="bg-red-600 border-red-700 text-white">
            <AlertDescription>
              Emergency services will <strong>not</strong> be contacted automatically. Only your app contacts were alerted.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // ------------------
  // Render: Countdown Screen
  if (showCountdown) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4 text-white">
        <h2 className="text-3xl font-bold mb-4">Sending SOS in {countdown}s</h2>
        <p className="mb-6 text-center">Press cancel if this was a mistake.</p>
        <Button 
          onClick={cancelCountdown}
          className="bg-white text-red-500 hover:bg-gray-200 text-lg px-6 py-3"
        >
          Cancel - I'm Safe
        </Button>
      </div>
    );
  }

  // ------------------
  // Render: SOS Button (default state)
  return (
    <div className="fixed bottom-20 right-4 z-40">
      <Button
        onClick={handleSOSPress}
        className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg border-4 border-white"
        size="sm"
      >
        SOS
      </Button>
    </div>
  );
}
