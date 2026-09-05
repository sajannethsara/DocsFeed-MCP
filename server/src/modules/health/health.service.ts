import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async checkHealth() {
    try {
      const userCount = await this.prisma.user.count();
      const serverCount = await this.prisma.mcpServer.count();
      const pageCount = await this.prisma.page.count();

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        stats: {
          users: userCount,
          mcpServers: serverCount,
          pages: pageCount,
        },
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown database error';
      return {
        status: 'error',
        message: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
