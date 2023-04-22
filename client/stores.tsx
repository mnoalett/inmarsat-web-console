import * as SocketIOClient from 'socket.io-client';
import create, { State } from 'zustand';

interface HistoryState extends State {
    socket: SocketIOClient.Socket,
    messages: Message[],
    load: () => void,
    add: (message: Message) => void,
};

const socket = SocketIOClient.io();

socket.on('connect', () => console.log('Connected...'));
socket.on('disconnect', () => console.error('Disconnected. Try reloading the page.'));
socket.on('init', () => console.log('Waiting for new messages...'));
socket.on('message', message => console.log(message));

export const useHistoryStore = create<HistoryState>(set => ({
    socket: socket,
    messages: [],
    load: () => {
        socket.emit('getHistory', (messages: Message[]) => {
            set({ messages });
        });
    },
    add: (message) => {
        set(state => {
            return {
                messages: [message, ...state.messages],
            }
        });
    },
}));