// Check forum/community data
const { PrismaClient } = require('@prisma/client');

async function checkForum() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 CHECKING FORUM DATA...\n');
    
    // Check categories
    const categories = await prisma.forumCategory.findMany({
      orderBy: { order: 'asc' }
    });
    
    console.log(`📁 Forum Categories: ${categories.length}`);
    if (categories.length > 0) {
      categories.forEach(cat => {
        console.log(`   - ${cat.name} (${cat.slug})`);
        console.log(`     ${cat.description}`);
        console.log(`     Icon: ${cat.icon}\n`);
      });
    } else {
      console.log('   ⚠️  NO CATEGORIES FOUND! Need to seed forum data.\n');
    }
    
    // Check posts
    const totalPosts = await prisma.forumPost.count();
    console.log(`💬 Total Forum Posts: ${totalPosts}`);
    
    if (totalPosts > 0) {
      const recentPosts = await prisma.forumPost.findMany({
        take: 5,
        include: {
          author: { select: { email: true } },
          category: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      console.log('\n   Recent posts:');
      recentPosts.forEach(post => {
        console.log(`   - "${post.title}" by ${post.author.email}`);
        console.log(`     Category: ${post.category.name}`);
        console.log(`     Views: ${post.views}\n`);
      });
    }
    
    // Check replies
    const totalReplies = await prisma.forumReply.count();
    console.log(`💭 Total Replies: ${totalReplies}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkForum();

