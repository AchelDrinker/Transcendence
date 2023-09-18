import { IoAdapter } from '@nestjs/platform-socket.io';
import * as socketio from 'socket.io';

export class SocketIoAdapter extends IoAdapter {
  constructor(app, private isCorsEnabled: boolean = false) {
    super(app);
  }

  createIOServer(port: number, options?: socketio.ServerOptions): socketio.Server {
    const apiUrlFront = process.env.NEXT_PUBLIC_API_URL_FRONT;
    if (this.isCorsEnabled) {
      options.cors = {
        origin: `${apiUrlFront}`,
        methods: ['GET', 'POST'],
        allowedHeaders: ['my-custom-header'],
        credentials: true,
      };
    }

    const server = super.createIOServer(port, options);

    return server;
  }
}
