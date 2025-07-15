import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    // TODO: Implement proper authentication
    // For testing purposes, we'll just return a token
    const payload = { 
      sub: '1adb53eb-37ba-4f94-9f7e-2e2e2e2e2e',
      email: loginDto.email,
      role: 'DOCTOR'
    };
    
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  @Get('users')
  async getUsers() {
    return this.authService.getUsers();
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return this.authService.getUserById(id);
  }
} 