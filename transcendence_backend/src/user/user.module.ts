import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { ChatModule } from '../chat/chat.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ChatModule, JwtModule.register({	secret: process.env.JWT_SECRET,	signOptions: { expiresIn: '1h' },})],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService] // exportez seulement UserService
})
export class UserModule {}
