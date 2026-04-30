import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { MenuItemsService } from './menu-items/menu-items.service';
import { MenuItemsController } from './menu-items/menu-items.controller';
import { MenuItemsModule } from './menu-items/menu-items.module';
import { TablesService } from './tables/tables.service';
import { TablesModule } from './tables/tables.module';
import { OrdersService } from './orders/orders.service';
import { OrdersModule } from './orders/orders.module';
import { RealtimeGateway } from './realtime/realtime.gateway';
import { AwsService } from './aws/aws.service';
import { AwsController } from './aws/aws.controller';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    MenuItemsModule,
    TablesModule,
    OrdersModule],
  controllers: [AppController, MenuItemsController, AwsController],
  providers: [AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard }, // todo requiere auth por defecto
    { provide: APP_GUARD, useClass: RolesGuard }, MenuItemsService, TablesService, OrdersService, RealtimeGateway, AwsService // y roles si aplica
  ],
})
export class AppModule {}