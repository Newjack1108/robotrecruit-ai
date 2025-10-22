import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { getTierFromPriceId } from '@/lib/stripe-config';
import { getTierPowerUpCredits, getTierUpgradeCredits } from '@/lib/powerup-credits';
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

  // Get current user to check their old tier
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    console.error('[STRIPE_WEBHOOK] User not found:', userId);
    return;
  }

  const oldTier = user.tier;
  const priceId = subscription.items.data[0].price.id;
  const newTier = getTierFromPriceId(priceId);
  
  // Calculate additional credits for tier upgrade
  const additionalCredits = getTierUpgradeCredits(oldTier, newTier);
  const newAllowance = user.powerUpAllowance + additionalCredits;

  await prisma.user.update({
    where: { id: userId },
    data: {
      tier: newTier,
      trialEndsAt: null, // Clear trial - they're now a paid subscriber
      messageCount: 0, // Reset message count
      dailyMessageLimit: 999999, // Effectively unlimited for paid users
      powerUpAllowance: newAllowance, // Add tier upgrade credits
    },
  });

  // Send notification about tier upgrade and credits
  if (additionalCredits > 0) {
    await prisma.notification.create({
      data: {
        userId: userId,
        type: 'subscription',
        title: '🚀 Tier Upgraded!',
        message: `Welcome to ${newTier === 2 ? 'Pro' : 'Premium'}! You've received ${additionalCredits} bonus powerup credits. Total credits: ${newAllowance}`,
        link: '/powerups/purchase',
      },
    });
  }

  console.log(`[STRIPE_WEBHOOK] Subscription created for user ${userId}, tier ${oldTier} -> ${newTier}, added ${additionalCredits} credits`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  
  if (!userId) {
    console.error('[STRIPE_WEBHOOK] No userId in subscription metadata');
    return;
  }

  // Get current user to check their old tier
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    console.error('[STRIPE_WEBHOOK] User not found:', userId);
    return;
  }

  const oldTier = user.tier;
  const priceId = subscription.items.data[0].price.id;
  const newTier = getTierFromPriceId(priceId);
  
  // Calculate additional credits for tier change
  const additionalCredits = getTierUpgradeCredits(oldTier, newTier);
  const newAllowance = user.powerUpAllowance + additionalCredits;

  await prisma.user.update({
    where: { id: userId },
    data: {
      tier: newTier,
      trialEndsAt: null, // Clear trial - they're now a paid subscriber
      dailyMessageLimit: 999999, // Effectively unlimited for paid users
      powerUpAllowance: newAllowance, // Add tier upgrade credits
    },
  });

  // Send notification about tier change and credits
  if (additionalCredits > 0) {
    await prisma.notification.create({
      data: {
        userId: userId,
        type: 'subscription',
        title: newTier > oldTier ? '⬆️ Tier Upgraded!' : '🔄 Subscription Updated',
        message: newTier > oldTier 
          ? `Upgraded to ${newTier === 2 ? 'Pro' : 'Premium'}! You've received ${additionalCredits} bonus powerup credits.`
          : `Your subscription has been updated.`,
        link: '/powerups/purchase',
      },
    });
  }

  console.log(`[STRIPE_WEBHOOK] Subscription updated for user ${userId}, tier ${oldTier} -> ${newTier}, status ${subscription.status}, added ${additionalCredits} credits`);
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

