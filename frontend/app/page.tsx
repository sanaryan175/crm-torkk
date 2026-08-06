'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context';

export default function RootPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      // Already logged in — send to the right place
      const orgSetupComplete = user.organization?.setupComplete ?? false;
      const userOnboardingComplete = user.onboardingComplete ?? false;

      if (user.isOwner && !orgSetupComplete) {
        router.replace('/onboarding/setup');
        return;
      }
      if (!user.isOwner && !userOnboardingComplete) {
        router.replace('/onboarding/user');
        return;
      }
      router.replace('/dashboard');
    } else {
      // Not logged in — go to login
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  // Show a simple spinner while resolving
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
}
