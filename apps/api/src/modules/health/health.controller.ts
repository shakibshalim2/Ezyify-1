import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { Public } from '../auth/auth.guard.js';
import { raw } from '../../common/envelope.interceptor.js';

@ApiTags('health')
@Controller('health')
@Public()
@SkipThrottle()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  live() {
    return raw({ status: 'ok', uptime: Math.round(process.uptime()) });
  }

  @Get('ready')
  async ready() {
    await this.prisma.$queryRaw`SELECT 1`;
    return raw({ status: 'ready', db: 'ok' });
  }
}
