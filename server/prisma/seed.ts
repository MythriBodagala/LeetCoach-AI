import { PrismaClient, PatternType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const problem = await prisma.problem.upsert({
    where: { slug: 'two-sum' },
    update: {},
    create: {
      leetcodeId: 1,
      slug: 'two-sum',
      title: 'Two Sum',
      difficulty: 'Easy',
      content: 'Given an array of integers, return indices of the two numbers such that they add up to a specific target.',
      patterns: [PatternType.TWO_POINTERS],
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
    },
  });
  console.log({ problem });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });