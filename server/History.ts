import * as fs from 'fs';
import * as path from 'path';

import {
    jsonExtension,
    maxHistoryItems,
    satdumpFilePath
} from './settings';

export default class {
    private history: Message[] = [];

    getHistory = () => this.history;

    init = async () => {
        fs.readdirSync(satdumpFilePath)
            .filter(fileName => (fileName.endsWith(jsonExtension)))
            .map(fileName => {
                let fullPath:string = path.join(satdumpFilePath, fileName);
                const stat = fs.statSync(path.join(satdumpFilePath, fileName));
                let rawdata = fs.readFileSync(fullPath, 'utf-8');
                let message = JSON.parse(rawdata);
                return <Message>{
                    message: message.message,
                    priority: message.priority,
                    timestamp: message.timestamp,
                    service_code_and_address_name: message.service_code_and_address_name,
                    message_sequence_number: message.message_sequence_number,
                    length: message.descriptor.length,
                    repetition_number: message.repetition_number,
                    ts: stat.mtime.getTime(),
                }
            })
            .sort((a, b) => a.ts - b.ts)
            .forEach(message => this.addToHistory(message));
    }

    addToHistory(message: Message): void {
        if (!message.message) {
            return;
        }
        this.history.unshift(message);
        if (this.history.length > maxHistoryItems) {
            this.history.slice(0, maxHistoryItems);
        }
    }
}
