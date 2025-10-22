import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const updates = [
      { slug: 'art-bot', id: 'asst_IMJNsM042XgIDHH65629JctE' },
      { slug: 'bee-bot', id: 'asst_kJNsFej5JIkK8nZDGf41GeFF' },
      { slug: 'boss-bot', id: 'asst_alUd7fuSnuEuvwgTYUlUAqpc' },
      { slug: 'diy-bot', id: 'asst_4JY8RPNDTK1qGfZiWFlLY3tZ' },
      { slug: 'fit-bot', id: 'asst_O2JhZpPTJQWpEM7slx9dS8W0' },
      { slug: 'game-bot', id: 'asst_9WQVVHBERTK5LzTxDKa5WlU4' },
      { slug: 'melody-bot', id: 'asst_PvOCjbTdfGskehFlAVoa0Qrb' },
      { slug: 'scout-bot', id: 'asst_E1oIIJLqyQRamy230ptZjp2k' },
      { slug: 'garden-bot', id: 'asst_882kubBs2MYuqm5Ga6CqGWym' },
      { slug: 'chef-bot', id: 'asst_0jw4QjFr5Fl51itQbLFTh65T' },
      { slug: 'brewster-bot', id: 'asst_AhlnN51MZnq0cBEA54uT8dx7' },
      { slug: 'equi-bot', id: 'asst_IpyrQUjjhwHu4OX432Izgvxn' },
      { slug: 'fishing-bot', id: 'asst_6DFGAfVHejPA3rT9bB7CYgoC' },
    ];

    for (const update of updates) {
      await prisma.bot.update({
        where: { slug: update.slug },
        data: { openaiAssistantId: update.id },
      });
    }

    return NextResponse.json({ success: true, message: 'All bot IDs updated!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


