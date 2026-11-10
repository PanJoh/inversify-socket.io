import 'reflect-metadata';
import 'dotenv/config';
import { Container } from "inversify";
import { AuthController } from "./controllers/auth.controller.js";
import { AuthService } from "./services/auth.service.js";
import { InversifyExpressHttpAdapter } from "@inversifyjs/http-express";
import { SocketIoServer } from '@panjoh/inversify-socket-io'
import { EchoHandler } from './socket-io-handlers/echo-handler.js';
import http from 'node:http';
import { AuthGuardSocketIo } from './guards/auth-guard-socket-io.js';
import { BoradcastService } from './services/boradcast.service.js';
import { BoradcastHandler } from './socket-io-handlers/broadcast.handler.js';
import { RoomSubscriptionHanlder } from './socket-io-handlers/room-subscription.handler.js';
import { RoomUnsubscribeHandler } from './socket-io-handlers/room-unsubscribe.handler.js';
import { EchoSumHandler } from './socket-io-handlers/echo-sum.handler.js';
import { GreetHandler } from './socket-io-handlers/greet-user.js';

const container = new Container();

container.bind(AuthController).toSelf();
container.bind(AuthService).toSelf();
container.bind(AuthGuardSocketIo).toSelf();
container.bind(EchoHandler).toSelf();
container.bind(BoradcastService).toSelf();
container.bind(BoradcastHandler).toSelf();
container.bind(RoomSubscriptionHanlder).toSelf();
container.bind(RoomUnsubscribeHandler).toSelf();
container.bind(EchoSumHandler).toSelf();
container.bind(GreetHandler).toSelf();

container.bind('server-name').toResolvedValue(() => {
    return new Promise<string>(resolve => setTimeout(() => resolve('the fancy server'), 1000));
})

const adapter = new InversifyExpressHttpAdapter(container, {
    useJson: true,
});

const app = await adapter.build();

const server = http.createServer(app);

const socketIoServer = new SocketIoServer(server, container);
socketIoServer.setErrorEvent('error-notification');
await socketIoServer.run();

server.listen(3000);