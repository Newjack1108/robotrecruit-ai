import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    version: '1.0.1',
    buildDate: new Date().toISOString(),
    features: {
      improvedChatErrorHandling: true,
      fishingBotFixed: true,
      uniqueBotCVs: true,
    },
    deploymentId: process.env.RAILWAY_DEPLOYMENT_ID || 'local',
    environment: process.env.NODE_ENV || 'development',
  });
}

