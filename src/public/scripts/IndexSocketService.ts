import { io, Socket } from "socket.io-client";
import { SocketEvents as SE } from "nostromo-shared/types/SocketEvents";
import { RoomLinkInfo } from "nostromo-shared/types/AdminTypes";

// Класс для работы с сокетами на главной странице
export default class IndexSocketService
{
    private socket: Socket = io("/", {
        'transports': ['websocket']
    });

    private roomList: HTMLDivElement;

    constructor()
    {
        console.debug("indexSocketHandler ctor");

        this.roomList = document.getElementById('roomList') as HTMLDivElement;

        this.socket.on('connect', () =>
        {
            console.info("Создано подключение веб-сокета");
            console.info("Client Id:", this.socket.id);
        });

        this.socket.on('connect_error', (err: Error) =>
        {
            console.log(err.message);
        });

        this.socket.on(SE.RoomList, (rooms: RoomLinkInfo[]) => this.createRoomList(rooms));
        this.socket.on(SE.RoomCreated, (room: RoomLinkInfo) => this.addRoomToList(room));
        this.socket.on(SE.RoomDeleted, (id: string) => this.removeRoomFromList(id));

        this.socket.on(SE.Disconnect, () => this.onDisconnect());
    }

    private createRoomList(rooms: RoomLinkInfo[]): void
    {
        for (const room of rooms)
        {
            this.addRoomToList(room);
        }
    }

    private addRoomToList(room: RoomLinkInfo): void
    {
        const roomListItem = document.createElement('a');
        roomListItem.classList.add('roomListItem');
        roomListItem.id = room.id;
        roomListItem.href = `/rooms/${room['id']}`;
        roomListItem.innerText = room['name'];

        this.roomList.appendChild(roomListItem);
    }

    private removeRoomFromList(id: string): void
    {
        const room = document.getElementById(id);
        if (room) room.remove();
    }

    private onDisconnect(): void
    {
        console.warn("Вы были отсоединены от веб-сервера (websocket disconnect)");
        const roomList: NodeListOf<HTMLAnchorElement> = document.querySelectorAll(".roomListItem");
        console.log(roomList);
        for (const room of roomList)
        {
            console.log(room);
            room.remove();
        }
    }
}