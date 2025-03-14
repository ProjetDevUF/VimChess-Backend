import {Socket} from 'socket.io'

export class Client {
    authorized: boolean;
    username: string;
    userUid: string;
    socket: Socket;
    anonymousTempToken?: string;
}