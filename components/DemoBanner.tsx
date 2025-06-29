'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function DemoBanner() {
  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800 dark:text-blue-200">
        <strong>Demo Mode:</strong> This application is running with mock data for testing. 
        All login, registration, and data operations are simulated. 
        Replace mock APIs with real backend endpoints when ready for production.
      </AlertDescription>
    </Alert>
  );
} 