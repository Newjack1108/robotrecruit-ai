import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_POWERUP!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const userId = session.metadata?.userId;
      const packageId = session.metadata?.packageId;
      const credits = parseInt(session.metadata?.credits || '0');

      if (!userId || !credits) {
        console.error('[WEBHOOK] Missing metadata:', session.metadata);
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }

      // Get current user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        console.error('[WEBHOOK] User not found:', userId);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Add credits to user's allowance
      const newAllowance = user.powerUpAllowance + credits;

      await prisma.user.update({
        where: { id: userId },
        data: {
          powerUpAllowance: newAllowance,
        },
      });

      console.log(`[WEBHOOK] Added ${credits} credits to user ${userId}. New allowance: ${newAllowance}`);

      // Optional: Create a notification for the user
      await prisma.notification.create({
        data: {
          userId: userId,
          type: 'powerup_purchase',
          title: 'Power-Up Credits Added! 🎉',
          message: `${credits} power-up credits have been added to your account. Start using advanced features now!`,
          link: '/chat',
        },
      });

    } catch (error: any) {
      console.error('[WEBHOOK] Error processing payment:', error);
      return NextResponse.json(
        { error: 'Failed to process payment' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}

