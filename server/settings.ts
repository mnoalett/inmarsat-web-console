export const satdumpLogPath = process.env.SATDUMP_LOG_PATH || 'C:\\Users\\marco\\Documents\\inmarsat\\test\\log.txt';
export const satdumpFilePath = process.env.SATDUMP_FILE_PATH || 'C:\\Users\\marco\\Documents\\inmarsat\\test\\';
export const jsonExtension = '.json';

export const username = process.env.USERNAME || 'admin';
export const password = process.env.PASSWORD || 'adm1n';
export const isSecure = process.env.SECURE === 'true' ? true : false;
export const isPublic = process.env.PUBLIC === 'true' ? true : false;
export const serverPort = process.env.PORT;

export const isDev = process.env.TS_NODE_DEV === 'true' ? true : false;

export const privateKeyPath = './selfsigned.key';
export const privateCaPath = './selfsigned.crt';

export const maxHistoryItems = 2000;
export const minimumFilesSize = 1000;
