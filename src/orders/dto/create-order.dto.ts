import { Type } from "class-transformer";
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from "class-validator";

export class CreateOrderItemDto {
    @IsNotEmpty({ message: "Debe de seleccionar un producto"})
    @IsString()
    menuItemId: string;

    @IsNotEmpty({ message: "Debe de ingresar la cantidad"})
    @Min(1)
    @IsInt()
    quantity: number;

    @IsOptional()
    @IsString()
    notes?: string;
}


export class CreateOrderDto {
    
    @IsString()
    @IsNotEmpty({message: "No se asigno la mesa"})
    tableId: string;

    @IsString()
    @IsOptional()
    notes: string;

    @IsArray()
    @IsNotEmpty({message: "La orden no debe de estar vacia"})
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    items: CreateOrderItemDto[];
}