import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enableDataExport() {
  try {
    // Check current bee-bot settings
    const beeBot = await prisma.bot.findUnique({
      where: { slug: 'bee-bot' },
      select: {
        slug: true,
        name: true,
        dataExport: true,
        imageRecognition: true,
        voiceResponse: true,
        fileUpload: true,
        webSearch: true,
        scheduling: true,
      },
    });

    if (!beeBot) {
      console.log('❌ Bee Bot not found');
      return;
    }

    console.log('📋 Current Bee Bot Power-ups:');
    console.log(`   Name: ${beeBot.name}`);
    console.log(`   Slug: ${beeBot.slug}`);
    console.log(`   📷 Image Recognition: ${beeBot.imageRecognition}`);
    console.log(`   🎤 Voice Response: ${beeBot.voiceResponse}`);
    console.log(`   📁 File Upload: ${beeBot.fileUpload}`);
    console.log(`   🌐 Web Search: ${beeBot.webSearch}`);
    console.log(`   📅 Scheduling: ${beeBot.scheduling}`);
    console.log(`   💾 Data Export: ${beeBot.dataExport}`);
    console.log('');

    if (beeBot.dataExport) {
      console.log('✅ Data Export is already enabled for Bee Bot!');
    } else {
      console.log('🔧 Enabling Data Export for Bee Bot...');
      
      await prisma.bot.update({
        where: { slug: 'bee-bot' },
        data: {
          dataExport: true,
        },
      });

      console.log('✅ Data Export enabled successfully!');
    }

    // Check all bots
    console.log('\n📊 All Bots with Data Export:');
    const allBots = await prisma.bot.findMany({
      where: { dataExport: true },
      select: { slug: true, name: true },
    });

    if (allBots.length === 0) {
      console.log('   (none)');
    } else {
      allBots.forEach(bot => {
        console.log(`   ✓ ${bot.name} (${bot.slug})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

enableDataExport();


