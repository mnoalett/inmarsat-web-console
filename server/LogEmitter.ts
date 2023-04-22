import Events from 'events';
import { Tail } from 'tail';

export default class extends Events {
    private tail: Tail | null = null;
    constructor(satdumpLogPath: string) {
        super();
        this.tail = new Tail(satdumpLogPath);
        this.init();
    }
    init() {
        if (this.tail !== null) {
            this.tail.on('error', (error: any) => console.error(error));
            this.tail.on('line', (line: string) => {
                const parsedLine = JSON.parse(line);
                if (parsedLine.service === 'CMCE'
                ) {
                    this.emit('log', parsedLine);
                }
            });
        }
    }
}
