import { io, Socket } from "socket.io-client";
import { SocketEvents as SE } from "nostromo-shared/types/SocketEvents";

// Класс для работы с сокетами при авторизации
export default class AuthSocketService
{

    private socket: Socket = io("/auth", {
        'transports': ['websocket']
    });

    private passInput = document.getElementById('pass')! as HTMLInputElement;
    private btn_join = document.getElementById('btn_join')! as HTMLButtonElement;

    constructor()
    {
        console.debug("authSocketHandler ctor");
        this.socket.on('connect', () =>
        {
            console.info("Создано подключение веб-сокета");
            console.info("Client Id:", this.socket.id);
        });

        this.socket.on('connect_error', (err: Error) =>
        {
            console.log(err.message);
        });

        this.socket.on(SE.RoomName, (roomName: string) =>
        {
            (document.getElementById('roomName') as HTMLSpanElement).innerText = roomName;
            (document.getElementById('auth') as HTMLDivElement).hidden = false;
        });

        this.socket.on(SE.Result, (success: boolean) =>
        {
            if (success) location.reload();
            else (document.getElementById('result') as HTMLParagraphElement).innerText = "Неправильный пароль!";
        });

        this.btn_join.addEventListener('click', () =>
        {
            const pass: string = (document.getElementById('pass') as HTMLInputElement).value;
            this.socket.emit(SE.JoinRoom, pass);
        });

        this.passInput.addEventListener('keydown', (e) =>
        {
            if (e.key == 'Enter' && !e.shiftKey)
            {
                e.preventDefault();
                this.btn_join.click();
            }
        });
    }
}