import { PartialType } from "@nestjs/mapped-types";
import { OrderStatus } from "@prisma/client";
import { IsEnum } from "class-validator";
import { CreateOrderDto } from "./create-order.dto";

export class UpdateOrderStatusDto extends PartialType(CreateOrderDto){
    @IsEnum(OrderStatus)
    status!: OrderStatus
}