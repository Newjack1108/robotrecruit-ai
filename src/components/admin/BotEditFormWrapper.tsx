'use client';

import dynamic from 'next/dynamic';

const BotEditForm = dynamic(
  () => import('./BotEditForm').then((mod) => ({ default: mod.BotEditForm })),
  { ssr: false }
);

export function BotEditFormWrapper({ bot }: { bot: any }) {
  return <BotEditForm bot={bot} />;
}

