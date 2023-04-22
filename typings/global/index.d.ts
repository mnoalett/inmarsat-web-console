declare interface KeyValue {
    [key: string]: any;
}

declare interface Message {
    message: string;
    priority: string;
    timestamp: number;
    length: number;
    service_code_and_address_name: string;
    message_sequence_number: number;
    repetition_number: number,
    ts: number;
}