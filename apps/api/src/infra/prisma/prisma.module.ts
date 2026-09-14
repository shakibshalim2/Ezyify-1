import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { AuditService } from '../../common/audit.service.js';

@Global()
@Module({ providers: [PrismaService, AuditService], exports: [PrismaService, AuditService] })
export class PrismaModule {}
