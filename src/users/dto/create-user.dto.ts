import { Optional } from "@nestjs/common"
import { ApiProperty } from "@nestjs/swagger"
import { Role } from "@prisma/client"
import { IsArray, IsBoolean, IsDate, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator"

export class CreateUserDto {
    @ApiProperty({description:'Nombre del usuario'})
    @IsNotEmpty({message: 'El nombre no puede estar vacío'})
    @IsString()
    name: string

    @ApiProperty({example: 'ejemplo@gmail.com', description: 'Correo del usuario'})
    @IsNotEmpty({message: 'El correo no puede estar vacío'})
    @IsEmail()
    email: string

    @ApiProperty({ description: 'Contraseña del usuario, minímo 6 caracteres'})
    @IsOptional()
    @IsString()
    @MinLength(6, {message: "La contraseña debe de tener al menos 6 caracteres"})
    password: string

    @ApiProperty({ description: 'Roles asignados al usuario', example: '[USER]'})
    @IsArray({ message: 'Debe de ser un listado de Roles' })
    @IsEnum(Role, { 
        each: true, 
        message: 'No es un Rol Válido' 
    })
    @IsNotEmpty({ message: 'El usuario debe tener al menos un rol' })
    roles: Role[]

    @ApiProperty({ description: 'Activar/Desactivar usuario'})
    @IsBoolean()
    isActive: boolean
 
    @ApiProperty({ description: 'Fecha de creación de usuario'})
    @IsString()
    createdAt: string
}