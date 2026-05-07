/**
 * model Table {
  id        String   @id @default(cuid())
  name      String   @unique   // "Mesa 1", "Terraza 2"
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())

  orders    Order[]
}
 * 
 */

import { IsBoolean, IsNotEmpty, IsNotEmptyObject, IsObject, IsOptional, IsString } from "class-validator";

export class CreateTableDto {

    @IsString()
    @IsNotEmpty({ message: "Campo nombre no debe esta vacío"})
    name!: string

    @IsBoolean()
    @IsOptional()
    isActive!: boolean

    @IsString()
    @IsNotEmpty({ message: "El área es requerida"})
    areaId!: string
}