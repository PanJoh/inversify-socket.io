import 'reflect-metadata';
import 'dotenv/config';
import { Container } from "inversify";
import { AuthController } from "./controllers/auth.controller.js";
import { AuthService } from "./services/auth.service.js";
import { InversifyExpressHttpAdapter } from "@inversifyjs/http-express";
import { SocketIoServer } from 'inversify-socket-io'
import { EchoHandler } from './socket-io-handlers/echo-handler.js';
import http from 'node:http';
import { AuthGuardSocketIo } from './guards/auth-guard-socket-io.js';

const container = new Container();

container.bind(AuthController).toSelf();
container.bind(AuthService).toSelf();
container.bind(AuthGuardSocketIo).toSelf();

const adapter = new InversifyExpressHttpAdapter(container, {
    useJson: true,
});

const app = await adapter.build();

const server = http.createServer(app);

const socketIoServer = new SocketIoServer(server, container);
socketIoServer.bindHandler(EchoHandler);
socketIoServer.run();

server.listen(3000);