import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import Stripe from 'stripe';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const userEmail = user?.emailAddresses[0]?.emailAddress || '';
    const isAdmin = adminEmails.includes(userEmail);
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if Stripe secret key exists
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { 
          error: 'Stripe secret key not configured',
          details: 'STRIPE_SECRET_KEY environment variable is missing'
        }, 
        { status: 400 }
      );
    }

    // Test Stripe connection
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
    });

    // Try to retrieve account info as a connection test
    const account = await stripe.accounts.retrieve();

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        country: account.country,
        email: account.email,
        type: account.type,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
      }
    });

  } catch (error: any) {
    console.error('[STRIPE_TEST_CONNECTION]', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to connect to Stripe',
        details: error.message
      }, 
      { status: 500 }
    );
  }
}

