'use client';

import { useState, useEffect } from 'react';
import { Tutorial } from './Tutorial';
import { useRouter } from 'next/navigation';

interface TutorialWrapperProps {
  shouldShowTutorial: boolean;
  initialStep: number;
}

export function TutorialWrapper({ shouldShowTutorial, initialStep }: TutorialWrapperProps) {
  const router = useRouter();
  const [showTutorial, setShowTutorial] = useState(shouldShowTutorial);

  useEffect(() => {
    setShowTutorial(shouldShowTutorial);
  }, [shouldShowTutorial]);

  if (!showTutorial) return null;

  return (
    <Tutorial
      initialStep={initialStep}
      onComplete={() => {
        setShowTutorial(false);
        router.refresh();
      }}
    />
  );
}

