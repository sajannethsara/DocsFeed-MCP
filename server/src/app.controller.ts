import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from './database/prisma.service';

// @ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  // @ApiOperation({ summary: 'Health check and database status' })
  async health() {
    try{
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
    }
  }catch(err){
    return{
      status: 'error',
      message: err.message,
      timestamp: new Date().toISOString(),
    }
  }}
}
