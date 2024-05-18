import * as fs from 'fs';
import * as path from 'path';

import {
    jsonExtension,
    maxHistoryItems,
    safetyNet,
    satdumpFilePath,
} from './settings';

export default class {
    private history: Message[] = [];

    getHistory = () => this.history;

    init = async () => {
        let filesPath = path.join(satdumpFilePath, safetyNet ? "EGC Message" : "Full Message");
        fs.readdirSync(filesPath)
            .filter(fileName => (fileName.endsWith(jsonExtension)))
            .map(fileName => {
                let fullPath: string = path.join(filesPath, fileName);
                const stat = fs.statSync(path.join(filesPath, fileName));
                let rawdata = fs.readFileSync(fullPath, 'utf-8');
                let message = JSON.parse(rawdata);
                if (safetyNet) {
                    return <SafetyNetMessage>{
                        message: message.message,
                        priority: message.priority,
                        timestamp: message.timestamp,
                        service_code_and_address_name: message.service_code_and_address_name,
                        message_sequence_number: message.message_sequence_number,
                        length: message.descriptor.length,
                        repetition_number: message.repetition_number,
                        ts: stat.mtime.getTime(),
                    }
                } else {
                    return <StdCMessage>{
                        message: message.message,
                        priority: message.priority,
                        timestamp: message.timestamp,
                        length: message.descriptor.length,
                        les_id: message.les_id,
                        les_name: message.les_name,
                        sat_name: message.sat_name,
                        ts: stat.mtime.getTime(),
                    }
                }
            })
            .sort((a, b) => a.timestamp - b.timestamp)
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
