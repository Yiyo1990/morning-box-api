import { IsBoolean, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateAreaDto {
    @IsString()
    @IsNotEmpty({message: 'El nombre del área es obligatorio'})
    @MinLength(3, {message: 'El nombre del área debe tener al menos 3 caracteres'})
    name!: string;

    @IsBoolean()
    @IsOptional()
    isActive!: boolean;
}