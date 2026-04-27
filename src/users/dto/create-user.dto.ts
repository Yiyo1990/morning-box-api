import { Optional } from "@nestjs/common"
import { Role } from "@prisma/client"
import { IsArray, IsBoolean, IsDate, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator"

export class CreateUserDto {
    @IsNotEmpty({message: 'El nombre no puede estar vacío'})
    @IsString()
    name: string

    @IsNotEmpty({message: 'El correo no puede estar vacío'})
    @IsEmail()
    email: string

    @IsOptional()
    @IsString()
    @MinLength(6, {message: "La contraseña debe de tener al menos 6 caracteres"})
    password: string

    @IsArray({ message: 'Debe de ser un listado de Roles' })
    @IsEnum(Role, { 
        each: true, 
        message: 'No es un Rol Válido' 
    })
    @IsNotEmpty({ message: 'El usuario debe tener al menos un rol' })
    roles: Role[]

    @IsBoolean()
    isActive: boolean
 
    @IsString()
    createdAt: string
}