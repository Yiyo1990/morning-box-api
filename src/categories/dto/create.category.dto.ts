import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCategoryDto {
    @IsNotEmpty({message: "El nombre de la categoria no debe estar vacío"})
    @IsString()
    name: string

    @IsOptional()
    @IsBoolean()
    isActive: boolean

    @IsString()
    @IsOptional()
    createdAt: string
}