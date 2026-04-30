import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService,
                private jwt: JwtService
    ) {}


    async login(email: string, password: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
    
        if (!user || !user.isActive) throw new UnauthorizedException('Credenciales inválidas');
    
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) throw new UnauthorizedException('Credenciales inválidas');
    
        const payload = { sub: user.id, email: user.email, roles: user.roles, name: user.name };
        const accessToken = await this.jwt.signAsync(payload);
    
        return {
          accessToken,
          user: { id: user.id, name: user.name, email: user.email, role: user.roles },
        };
      }

}
