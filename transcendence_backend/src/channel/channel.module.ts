import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './channel.entity';
import { ChannelGateway } from './channel.gateway';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Channel])],
  providers: [ChannelGateway, ChannelService],
  controllers: [ChannelController],
  exports: [TypeOrmModule, ChannelGateway], // Exportez ChatGateway si nécessaire
})
export class ChannelModule {}