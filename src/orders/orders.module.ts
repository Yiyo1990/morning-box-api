import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { RealtimeGateway } from '@realtime/realtime.gateway';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, RealtimeGateway]
})
export class OrdersModule {}
