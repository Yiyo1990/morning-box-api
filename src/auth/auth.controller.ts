import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {

    constructor(private auth: AuthService) {}

    @Public()
    @Post('login')
    @ApiOperation({summary: 'Inicia sesión del usuario'})
    @ApiResponse({ status: 201, description: 'Login exitoso.'})
    @ApiResponse({ status: 403, description: 'Prohibido.'})
    login(@Body() dto: LoginDto) {
        return this.auth.login(dto.email, dto.password)
    }
}
