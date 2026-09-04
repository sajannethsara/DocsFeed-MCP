import { PrismaClient, McpServerStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.page.deleteMany();
  await prisma.mcpServer.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const passwordHash = await bcrypt.hash('password123', 10);
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@docsfeed.dev',
      name: 'Demo User',
      passwordHash,
    },
  });

  console.log(`👤 Created demo user: ${demoUser.email} (password: password123)`);

  // Create Sample MCP Servers for this user
  const nestJsServer = await prisma.mcpServer.create({
    data: {
      userId: demoUser.id,
      name: 'NestJS Official Docs',
      description: 'Documentation for NestJS progressive Node.js framework',
      rootUrl: 'https://docs.nestjs.com',
      status: McpServerStatus.READY,
      apiKey: 'df_live_nest_9f83a2bc81e74a1',
      embeddingProvider: 'openai',
      embeddingModel: 'text-embedding-3-small',
      totalPages: 42,
      pages: {
        create: [
          {
            url: 'https://docs.nestjs.com/first-steps',
            title: 'First steps - Overview',
            markdownContent: '# First steps\n\nIn this article, you will learn the core fundamentals of Nest.',
          },
          {
            url: 'https://docs.nestjs.com/controllers',
            title: 'Controllers',
            markdownContent: '# Controllers\n\nControllers are responsible for handling incoming requests and returning responses to the client.',
          },
        ],
      },
    },
  });

  const nextJsServer = await prisma.mcpServer.create({
    data: {
      userId: demoUser.id,
      name: 'Next.js App Router',
      description: 'Next.js 15 documentation including Server Components and Server Actions',
      rootUrl: 'https://nextjs.org/docs',
      status: McpServerStatus.READY,
      apiKey: 'df_live_next_1d48c0ba49e29a3',
      embeddingProvider: 'local',
      embeddingModel: 'nomic-embed-text',
      totalPages: 78,
      pages: {
        create: [
          {
            url: 'https://nextjs.org/docs/app/building-your-application/routing',
            title: 'Routing Fundamentals',
            markdownContent: '# Routing Fundamentals\n\nThe skeleton of every application is routing.',
          },
        ],
      },
    },
  });

  const prismaServer = await prisma.mcpServer.create({
    data: {
      userId: demoUser.id,
      name: 'Prisma ORM Docs',
      description: 'Prisma Client, Migrate, and Schema references',
      rootUrl: 'https://www.prisma.io/docs',
      status: McpServerStatus.CRAWLING,
      apiKey: 'df_live_prisma_7b29a1ee32c84f5',
      embeddingProvider: 'openai',
      embeddingModel: 'text-embedding-3-small',
      totalPages: 15,
    },
  });

  console.log(`🚀 Seeded 3 MCP servers for user:`);
  console.log(`  - [READY] ${nestJsServer.name} (${nestJsServer.apiKey})`);
  console.log(`  - [READY] ${nextJsServer.name} (${nextJsServer.apiKey})`);
  console.log(`  - [CRAWLING] ${prismaServer.name} (${prismaServer.apiKey})`);
  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
