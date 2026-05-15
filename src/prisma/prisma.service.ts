import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg';


@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy{

    /*constructor() {
        const url = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@localhost:${process.env.DB_PORT_EXTERNAL}/${process.env.DB_NAME}?schema=${process.env.DB_SCHEMA}`;
        
        const adapter = new PrismaPg({
          connectionString: url!,
        });
    
        super({ adapter });
      }*/

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
    