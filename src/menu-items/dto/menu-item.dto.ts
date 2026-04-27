import { Category } from "@prisma/client"

/**
 * name        String
  description String?
  price       Decimal  @db.Decimal(10,2)
  imageUrl    String?
  isActive    Boolean  @default(true)

  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  orderItems  OrderItem[]
 * 
 */
export class MenuItem {
    name: string
    description: string
    price: Number
    imageUrl: string
    isActive: boolean
    categoryId: String
    
    category: Category
}