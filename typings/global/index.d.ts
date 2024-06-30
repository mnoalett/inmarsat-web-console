declare interface KeyValue {
    [key: string]: boolean;
}

declare interface Message {
    message: string;
    timestamp: number;
    length: number;
    ts: number;
}

declare interface SafetyNetMessage extends Message {
    priority: string;
    service_code_and_address_name: string;
    message_sequence_number: number;
    repetition_number: number,

}

declare interface StdCMessage extends Message {
    les_name: string;
    sat_name: string;
    les_id: number;
}