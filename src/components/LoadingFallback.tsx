import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingFallbackProps {
  message?: string;
}

export function LoadingFallback({ message = 'Loading...' }: LoadingFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
} 