import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import { SocketIoAdapter } from './socket-io.adapter';
import { existsSync, readFileSync } from 'fs';
const path = require('path')


async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create(AppModule);
  const apiUrlFront = process.env.NEXT_PUBLIC_API_URL_FRONT;

  app.use(cookieParser());
  

  app.enableCors({
    origin: `${apiUrlFront}`,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.use('/image/:imageName', (req,res)=> {
    const imageName = req.params.imageName;
    const imagePath = path.join(__dirname, '..', 'images', imageName);

    if(existsSync(imagePath)){
      const image = readFileSync(imagePath);
      res.end(image)
    }else{
      res.status(404).json({message: 'image not found'});
    }
  })
  
  app.useWebSocketAdapter(new SocketIoAdapter(app, true));
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // whitelist: true : Supprime les propriétés non whitelisted (celles qui ne sont pas définies dans le DTO ou l'entité) de l'objet entrant.
  // forbidNonWhitelisted: true : Renvoie une erreur si des propriétés non whitelisted sont fournies dans l'objet entrant.
  // transform: true : Transforme l'objet entrant en instance de la classe appropriée, ce qui permet d'appeler les méthodes sur l'objet 
  // et de tirer parti des propriétés de classe comme les getters et les setters.


  await app.listen(4000, '0.0.0.0');
}

bootstrap();
