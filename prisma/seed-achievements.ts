import { seedAchievements } from '../src/lib/achievement-checker';

async function main() {
  await seedAchievements();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });

