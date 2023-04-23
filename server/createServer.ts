import express from 'express';
import basicAuth from 'express-basic-auth';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import localtunnel from 'localtunnel';
import Bundler from 'parcel-bundler';
import { Server as SocketIOServer } from 'socket.io';

import {
    isDev,
    isPublic,
    isSecure,
    password,
    privateCaPath,
    privateKeyPath,
    serverPort,
    username
} from './settings';

export default (serverReadyCallback: (app: express.Express, io: SocketIOServer) => void): void => {

    const app = express();

    const bundler = new Bundler('./client/index.html', {
        hmr: isDev
    });

    const users: KeyValue = {};
    users[username] = password;

    app.use(basicAuth({
        users,
        challenge: true,
    }));

    app.use(bundler.middleware());

    let httpServer: http.Server;

    if (isSecure) {
        try {
            const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
            const certificate = fs.readFileSync(privateCaPath, 'utf8');
            const credentials = { key: privateKey, cert: certificate, host: '0.0.0.0' };
            httpServer = https.createServer(credentials, app);
        } catch (error) {
            console.error(error, 'Make sure that you generated the server certificates using generate-cert.sh');
            process.exit(1);
        }
    } else {
        httpServer = http.createServer(app);
    }

    if (isPublic && serverPort) {
        localtunnel({
            port: parseInt(serverPort),
            allow_invalid_cert: true,
            local_key: privateKeyPath,
            local_ca: privateCaPath,
            local_https: isSecure,
        }).then((tunnel: any) => {
            console.log(`Public URL ready: ${tunnel.url}`);
        });
    }

    const io = new SocketIOServer(httpServer);

    httpServer.listen(parseInt(serverPort!), '0.0.0.0', () => {
        const port = (<any>httpServer.address()).port;
        const address = (<any>httpServer.address());
        const type = isSecure ? 'https://' : 'http://';
        console.log(`Server started: ${type}${address.address}:${port}`);
        serverReadyCallback(app, io);
    });
}
