import { OrderItem } from "@prisma/client"
import { IsBoolean, IsNumber, IsObject, IsString } from "class-validator"
import { CreateCategoryDto } from "src/categories/dto/create.category.dto"

export class MenuItem {

    @IsString()
    name: string

    @IsString()
    description: string
    
    @IsNumber()
    price: Number

    @IsString()
    imageUrl: string
    
    @IsBoolean()
    isActive: boolean
    
    @IsString()
    categoryId: String
    
    @IsObject()
    category: CreateCategoryDto

    createdAt: string

    updatedAt: string

    orderItems: OrderItem[]
}