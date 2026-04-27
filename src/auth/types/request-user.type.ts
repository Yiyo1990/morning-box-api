import { Role } from "@prisma/client"

export type RequestUser  = {
    sub: string //userId
    email: string
    roles: Role[]
    name?: string
}