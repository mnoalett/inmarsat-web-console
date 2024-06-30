import express from 'express';
import * as http from 'http';
import Parcel from '@parcel/core';
import basicAuth from 'express-basic-auth';
import { Server as SocketIOServer } from 'socket.io';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { AddressInfo } from 'net';

import {
    isDev,
    serverPort,
    username,
    password
} from './settings';

export default async (serverReadyCallback: (app: express.Express, io: SocketIOServer) => void): Promise<void> => {

    const parcelPort = 4000;
    const app = express();

    const bundler = new Parcel({
        entries: './client/index.html',
        mode: isDev ? 'development' : 'production',
        serveOptions: {
            port: Number(parcelPort)
        }
    });

    await bundler.watch();

    const parcelMiddleware = createProxyMiddleware({
        target: `http://localhost:${parcelPort}/`,
    });

    app.use('/', parcelMiddleware);

    if (username && password) {
        const users: Record<string, string> = {};
        users[username] = password;
        app.use(basicAuth({
            users,
            challenge: true,
        }));
    }

    const httpServer: http.Server = http.createServer(app);

    const io = new SocketIOServer(httpServer);

    httpServer.listen(serverPort, () => {
        const port = (<AddressInfo>httpServer.address()).port;
        const address = (<AddressInfo>httpServer.address());
        console.log(`Server started: http://${address.address}:${port}`);
        serverReadyCallback(app, io);
    });
}
