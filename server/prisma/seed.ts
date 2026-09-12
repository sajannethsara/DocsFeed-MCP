import { PrismaClient, McpServerStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: [path.resolve(process.cwd(), '.env'), path.resolve(process.cwd(), '../.env'), path.resolve(__dirname, '../../.env')] });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.mcpServer.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Seed Alice (Frontend / Fullstack Lead)
  const alice = await prisma.user.create({
    data: {
      email: 'alice@docsfeed.dev',
      name: 'Alice Chen',
      passwordHash,
      mcpServers: {
        create: [
          {
            name: 'NestJS Framework',
            description: 'Core architectural docs, microservices, and dependency injection patterns',
            rootUrl: 'https://docs.nestjs.com',
            status: McpServerStatus.READY,
            apiKey: 'df_live_nest_9f83a2bc81e74a1',
            embeddingProvider: 'openai',
            embeddingModel: 'text-embedding-3-small',
            totalPages: 48,
          },
          {
            name: 'Next.js App Router',
            description: 'Server Components, Server Actions, routing conventions, and caching',
            rootUrl: 'https://nextjs.org/docs',
            status: McpServerStatus.READY,
            apiKey: 'df_live_next_1d48c0ba49e29a3',
            embeddingProvider: 'openai',
            embeddingModel: 'text-embedding-3-small',
            totalPages: 112,
          },
          {
            name: 'Tailwind CSS',
            description: 'Utility-first CSS framework reference, responsive modifiers, and theme configuration',
            rootUrl: 'https://tailwindcss.com/docs',
            status: McpServerStatus.READY,
            apiKey: 'df_live_tw_3c92e1af78a10bc',
            embeddingProvider: 'openai',
            embeddingModel: 'text-embedding-3-small',
            totalPages: 85,
          },
        ],
      },
    },
    include: { mcpServers: true },
  });

  // 2. Seed Bob (AI / ML Systems Engineer)
  const bob = await prisma.user.create({
    data: {
      email: 'bob@docsfeed.dev',
      name: 'Bob Martinez',
      passwordHash,
      mcpServers: {
        create: [
          {
            name: 'LangChain Python',
            description: 'Chains, agents, memory persistence, and tool abstractions',
            rootUrl: 'https://python.langchain.com/docs',
            status: McpServerStatus.READY,
            apiKey: 'df_live_lang_7a42d0fa55b91cf',
            embeddingProvider: 'local',
            embeddingModel: 'nomic-embed-text',
            totalPages: 140,
          },
          {
            name: 'Hugging Face Transformers',
            description: 'Model hubs, pipelines, tokenizers, and PyTorch/TensorFlow integrations',
            rootUrl: 'https://huggingface.co/docs/transformers',
            status: McpServerStatus.CRAWLING,
            apiKey: 'df_live_hf_4f81c9be22e47aa',
            embeddingProvider: 'local',
            embeddingModel: 'nomic-embed-text',
            totalPages: 0,
          },
          {
            name: 'PyTorch Documentation',
            description: 'Tensors, CUDA backends, autograd, and neural network modules',
            rootUrl: 'https://pytorch.org/docs/stable',
            status: McpServerStatus.PENDING,
            apiKey: 'df_live_torch_8c17b5fe90a34cb',
            embeddingProvider: 'local',
            embeddingModel: 'nomic-embed-text',
            totalPages: 0,
          },
        ],
      },
    },
    include: { mcpServers: true },
  });

  // 3. Seed Demo Contributor (Student Sandbox & Edge Case Testing)
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@docsfeed.dev',
      name: 'Dev Contributor',
      passwordHash,
      mcpServers: {
        create: [
          {
            name: 'Prisma ORM Reference',
            description: 'Prisma Client, schema references, relations, and pgvector adapter notes',
            rootUrl: 'https://www.prisma.io/docs',
            status: McpServerStatus.READY,
            apiKey: 'df_live_prisma_7b29a1ee32c84f5',
            embeddingProvider: 'openai',
            embeddingModel: 'text-embedding-3-small',
            totalPages: 34,
          },
          {
            name: 'Model Context Protocol Spec',
            description: 'Official MCP protocol specification, tools, prompts, and resources schemas',
            rootUrl: 'https://modelcontextprotocol.io',
            status: McpServerStatus.READY,
            apiKey: 'df_live_mcp_0a12e3dc45f67ba',
            embeddingProvider: 'openai',
            embeddingModel: 'text-embedding-3-small',
            totalPages: 18,
          },
          {
            name: 'Docker Engine & Compose Docs',
            description: 'Failed crawl example for testing error recovery and retry triggers',
            rootUrl: 'https://docs.docker.com',
            status: McpServerStatus.FAILED,
            apiKey: 'df_live_dock_5d90e2ac66f12fe',
            embeddingProvider: 'openai',
            embeddingModel: 'text-embedding-3-small',
            totalPages: 0,
          },
        ],
      },
    },
    include: { mcpServers: true },
  });

  console.log(`👤 Seeded 3 users (password for all: password123):`);
  console.log(`  - ${alice.name} (${alice.email}) -> ${alice.mcpServers.length} feeds`);
  console.log(`  - ${bob.name} (${bob.email}) -> ${bob.mcpServers.length} feeds`);
  console.log(`  - ${demoUser.name} (${demoUser.email}) -> ${demoUser.mcpServers.length} feeds`);
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
