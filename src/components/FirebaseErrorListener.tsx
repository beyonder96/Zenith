'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: Error) => {
      console.error("Caught a Firebase error:", error);
      
      if (error instanceof FirestorePermissionError) {
          // This will throw an uncaught exception, which Next.js will display in its development overlay.
          // This is the desired behavior for detailed debugging during development.
          throw error;
      }

      // Fallback for other errors
      toast({
        variant: 'destructive',
        title: 'An unexpected error occurred',
        description: error.message || 'Please check the console for more details.',
      });
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null; // This component does not render anything
}
