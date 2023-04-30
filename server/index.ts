require('dotenv').config();

import * as fs from 'fs';
import * as path from 'path';

import History from './History';
import LogEmitter from './LogEmitter';

import createServer from './createServer';
import waitForFile from './waitForFile';

import {
    jsonExtension,
    safetyNet,
    satdumpFilePath,
    satdumpLogPath,
} from './settings';

if (!fs.existsSync(satdumpFilePath)) {
    console.error('Satdump path not found: ', satdumpFilePath);
    process.exit(1);
}

createServer(async (app, io) => {

    const history = new History();

    // FIXME: renamed is fired on append also so we need to keep a hash of known files
    const processedFiles: KeyValue = {}; 

    const broadcastMessage = (message: string): void => {
        io.emit('message', message);
    }

    await history.init();

    io.on('connection', socket => {
        socket.emit('init');
        socket.on('getHistory', (socketCallback: (history: Message[]) => {}) =>
            socketCallback(history.getHistory())
        );
    });

    try {
        const logEmitter = new LogEmitter(satdumpLogPath);
        logEmitter.on('log', log => io.emit('cmceLog', log))
    } catch (exception) {
        console.error('Log emitter failed: ', exception)
    }
    
    fs.watch(satdumpFilePath, async (eventType, fileName) => {
        const unprocessedFilePath = path.join(satdumpFilePath, fileName);
        if (
            eventType === 'rename' && 
            !processedFiles[fileName] &&
            fileName.endsWith(jsonExtension) && 
            fs.existsSync(unprocessedFilePath)
        ) {

            processedFiles[fileName] = true;
            broadcastMessage('New file detected: ' + fileName);

            const fileStat = await waitForFile(unprocessedFilePath);

            let rawdata = fs.readFileSync(unprocessedFilePath, 'utf-8');
            let message = JSON.parse(rawdata);
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
            delete processedFiles[fileName];
        }
    });
});