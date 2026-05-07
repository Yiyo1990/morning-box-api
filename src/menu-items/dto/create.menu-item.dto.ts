import { Type } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator"

export class CreateMenuItemDto {

    @IsString({message: "El campo nombre debe ser un texto válido"})
    @IsNotEmpty({message: "El campo nombre no debe estar vacío"})
    @MinLength(2, {message: "El campo nombre debe tener al menos 2 caracteres"})
    name!: string;

    @IsString({message: "El campo descripción debe ser un texto válido"})
    @IsOptional()
    description?: string;

    @IsNumber({ maxDecimalPlaces: 2 }, { message: "El campo precio debe ser un número válido hasta por 2 decimales" })
    @Min(0, { message: "El precio debe ser un número positivo" })
    @Type(() => Number) // Transforma el input a número
    price!: number;

    @IsString({message: "El campo URL de imagen debe ser un texto válido"})
    @IsOptional()
    imageUrl?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsString({message: "El campo categoría debe ser un texto válido"})
    @IsNotEmpty({message: "El campo categoría no debe estar vacío"})
    categoryId!: string;
}