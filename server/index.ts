import * as fs from 'fs';
import * as path from 'path';
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
dotenv.config();

import History from './History';

import createServer from './createServer';
import waitForFile from './waitForFile';

import {
    enableTelegramMessage,
    jsonExtension,
    safetyNet,
    satdumpFilePath,
    telegramChannel,
    telegramToken
} from './settings';

if (!fs.existsSync(satdumpFilePath)) {
    console.error('Satdump path not found: ', satdumpFilePath);
    process.exit(1);
}

createServer(async (app, io) => {

    const history = new History();

    const filesPath: string = path.join(satdumpFilePath, safetyNet ? "EGC Message" : "Full Message");
    const tg = enableTelegramMessage ? new Telegraf(telegramToken) : null;

    // FIXME: renamed is fired on append also so we need to keep a hash of known files
    const processedFiles: KeyValue = {};

    const broadcastMessage = (message: string): void => {
        io.emit('message', message);
    }

    await history.init();

    io.on('connection', socket => {
        socket.emit('init');
        socket.on('getHistory', (socketCallback: (history: Message[]) => void) =>
            socketCallback(history.getHistory())
        );
    });

    fs.watch(filesPath, async (eventType, fileName) => {
        const unprocessedFilePath = path.join(filesPath, fileName!);
        if (
            eventType === 'rename' &&
            !processedFiles[fileName!] &&
            fileName!.endsWith(jsonExtension) &&
            fs.existsSync(unprocessedFilePath)
        ) {

            processedFiles[fileName!] = true;
            broadcastMessage('New file detected: ' + fileName);

            const fileStat = await waitForFile(unprocessedFilePath);

            const rawdata = fs.readFileSync(unprocessedFilePath, 'utf-8');
            const message = JSON.parse(rawdata);
            let newMessage: Message;

            if (safetyNet) {
                const newSaferyNetMessage: SafetyNetMessage = {
                    message: message.message,
                    priority: message.priority,
                    timestamp: message.timestamp,
                    service_code_and_address_name: message.service_code_and_address_name,
                    message_sequence_number: message.message_sequence_number,
                    length: message.descriptor.length,
                    repetition_number: message.repetition_number,
                    ts: fileStat.mtime.getTime(),
                }
                newMessage = newSaferyNetMessage;
                if (enableTelegramMessage && message.priority === "Distress") {
                    tg!.telegram.sendMessage(telegramChannel, newMessage.message);
                }
            } else {
                const newStdCMessage: StdCMessage = {
                    message: message.message,
                    timestamp: message.timestamp,
                    les_id: message.les_id,
                    les_name: message.les_name,
                    sat_name: message.sat_name,
                    length: message.descriptor.length,
                    ts: fileStat.mtime.getTime(),
                }
                newMessage = newStdCMessage;
            }

            history.addToHistory(newMessage);

            broadcastMessage('Sending:  ' + fileName);
            io.emit('newMessage', newMessage);
            delete processedFiles[fileName!];
        }
    });
});