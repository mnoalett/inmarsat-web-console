export const satdumpFilePath = process.env.SATDUMP_FILE_PATH || '/messages';
export const jsonExtension = '.json';

export const username = process.env.USERNAME;
export const password = process.env.PASSWORD;
export const isSecure = process.env.SECURE === 'true';
export const isPublic = process.env.PUBLIC === 'true';
export const serverPort = process.env.PORT || '8080';

export const safetyNet = process.env.SAFETYNET === 'true';

export const isDev = process.env.TS_NODE_DEV === 'true';

export const privateKeyPath = './selfsigned.key';
export const privateCaPath = './selfsigned.crt';

export const maxHistoryItems = 2000;

export const enableTelegramMessage = process.env.TELEGRAM_ENABLE || false
export const telegramChannel = process.env.TELEGRAM_CHANNEL || 0
export const telegramToken = process.env.TELEGRAM_TOKEN || ''
