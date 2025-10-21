'use client';

import { UserButton } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export function UserButtonWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-0.5 rounded-full">
        <div className="w-10 h-10 rounded-full bg-gray-800 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-0.5 rounded-full">
      <UserButton 
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: "w-10 h-10"
          }
        }}
      />
    </div>
  );
}



