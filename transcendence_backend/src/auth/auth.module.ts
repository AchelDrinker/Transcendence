import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { FortyTwoStrategy } from './strategy/42.strategy';
import { JwtStrategy } from './jwt.strategy';  // Assurez-vous que le chemin d'accès est correct
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaClient } from '@prisma/client';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET, 
      signOptions: { expiresIn: '3h' },
    }),
  ],
  providers: [FortyTwoStrategy, JwtStrategy, AuthService, PrismaClient],
  exports: [PassportModule, AuthService],
  controllers: [AuthController],
})
export class AuthModule {}