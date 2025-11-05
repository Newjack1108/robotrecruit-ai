'use client';

import { useState } from 'react';
import { Users } from 'lucide-react';
import { InviteModal } from './InviteModal';

export function InviteButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors group"
      >
        <Users className="w-4 h-4 group-hover:animate-pulse" />
        <span className="font-orbitron font-medium">Invite Friends</span>
      </button>

      <InviteModal open={showModal} onOpenChange={setShowModal} />
    </>
  );
}

