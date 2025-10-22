import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { getTierFromPriceId } from '@/lib/stripe-config';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('[STRIPE_WEBHOOK_ERROR]', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  console.log(`[STRIPE_WEBHOOK] Event type: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription') {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          await handleSubscriptionCreated(subscription);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        
        if (invoice.subscription && typeof invoice.subscription === 'string') {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription
          );
          await handleSubscriptionUpdated(subscription);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        
        if (invoice.subscription && typeof invoice.subscription === 'string') {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription
          );
          
          // Log payment failure - user will retain access until subscription ends
          const userId = subscription.metadata.userId;
          if (userId) {
            console.log(`[STRIPE_WEBHOOK] Payment failed for user ${userId}`);
            // Note: Stripe will handle retries and eventual cancellation
          }
        }
        break;
      }

      default:
        console.log(`[STRIPE_WEBHOOK] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[STRIPE_WEBHOOK_HANDLER_ERROR]', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  
  if (!userId) {
    console.error('[STRIPE_WEBHOOK] No userId in subscription metadata');
    return;
  }

  // Get tier from price ID
  const priceId = subscription.items.data[0].price.id;
  const tier = getTierFromPriceId(priceId);

  await prisma.user.update({
    where: { id: userId },
    data: {
      tier,
      trialEndsAt: null, // Clear trial - they're now a paid subscriber
      messageCount: 0, // Reset message count
      dailyMessageLimit: 999999, // Effectively unlimited for paid users
    },
  });

  console.log(`[STRIPE_WEBHOOK] Subscription created for user ${userId}, tier ${tier} - trial cleared`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  
  if (!userId) {
    console.error('[STRIPE_WEBHOOK] No userId in subscription metadata');
    return;
  }

  // Get tier from price ID
  const priceId = subscription.items.data[0].price.id;
  const tier = getTierFromPriceId(priceId);

  await prisma.user.update({
    where: { id: userId },
    data: {
      tier,
      trialEndsAt: null, // Clear trial - they're now a paid subscriber
      dailyMessageLimit: 999999, // Effectively unlimited for paid users
    },
  });

  console.log(`[STRIPE_WEBHOOK] Subscription updated for user ${userId}, tier ${tier}, status ${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  
  if (!userId) {
    console.error('[STRIPE_WEBHOOK] No userId in subscription metadata');
    return;
  }

  // Downgrade to free tier and restore trial period (7 days from now)
  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      tier: 1, // Free tier
      trialEndsAt, // Give them a 7-day grace period
      messageCount: 0,
      dailyMessageLimit: 10, // Back to 10 messages per day
      lastMessageReset: now,
    },
  });

  console.log(`[STRIPE_WEBHOOK] Subscription deleted for user ${userId}, downgraded to free tier with 7-day grace period`);
}

