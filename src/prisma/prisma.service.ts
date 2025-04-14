import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('[Prisma] Successfully connected to the database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('[Prisma] Successfully disconnected from the database');
  }

  // optional: ใช้เพื่อให้ shutdown hook ของ Nest เรียก disconnect
  async enableShutdownHooks() {
    process.on('SIGINT', async () => {
      await this.$disconnect();
      console.log('[Prisma] Gracefully shutdown (SIGINT)');
    });

    process.on('SIGTERM', async () => {
      await this.$disconnect();
      console.log('[Prisma] Gracefully shutdown (SIGTERM)');
    });
  }
}
