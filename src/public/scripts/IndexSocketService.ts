import { io, Socket } from "socket.io-client";
import { SocketEvents as SE } from "nostromo-shared/types/SocketEvents";
import { PublicRoomInfo } from "nostromo-shared/types/RoomTypes";
import { NewRoomNameInfo } from "nostromo-shared/types/AdminTypes";

// Класс для работы с сокетами на главной странице
export default class IndexSocketService
{
    private socket: Socket = io("/", {
        'transports': ['websocket']
    });

    private roomList: HTMLDivElement;

    constructor()
    {
        console.debug("IndexSocketService ctor");

        this.roomList = document.getElementById('room-list') as HTMLDivElement;

        this.socket.on('connect', () =>
        {
            console.info("Создано подключение веб-сокета");
            console.info("Client Id:", this.socket.id);
        });

        this.socket.on('connect_error', (err: Error) =>
        {
            console.log(err.message);
        });

        this.socket.on(SE.RoomList, (rooms: PublicRoomInfo[]) => this.createRoomList(rooms));
        this.socket.on(SE.RoomCreated, (room: PublicRoomInfo) => this.addRoomToList(room));
        this.socket.on(SE.RoomDeleted, (id: string) => this.removeRoomFromList(id));
        this.socket.on(SE.RoomNameChanged, (info: NewRoomNameInfo) => this.updateRoomInList(info));

        this.socket.on(SE.Disconnect, () => this.onDisconnect());
    }

    private createRoomList(rooms: PublicRoomInfo[]): void
    {
        // Очищаем список, перед добавлением комнат.
        this.roomList.innerHTML = "";

        for (const room of rooms)
        {
            this.addRoomToList(room);
        }
    }

    private addRoomToList(room: PublicRoomInfo): void
    {
        const roomListItem = document.createElement("a");
        roomListItem.classList.add("room-list-item");
        roomListItem.id = room.id;
        roomListItem.href = `/r/${room.id}`;

        const roomItemLabel = document.createElement("span");
        roomItemLabel.innerText = room.name;
        roomItemLabel.classList.add("room-list-item-label");

        const roomItemId = document.createElement("span");
        roomItemId.innerText = `#${room.id}`;
        roomItemId.classList.add("room-list-item-id");

        const roomItemJoinLabel = document.createElement("span");
        roomItemJoinLabel.innerText = "Войти";
        roomItemJoinLabel.classList.add("room-list-item-join");

        roomListItem.appendChild(roomItemLabel);
        roomListItem.appendChild(roomItemId);
        roomListItem.appendChild(roomItemJoinLabel);

        this.roomList.appendChild(roomListItem);
    }

    private removeRoomFromList(id: string): void
    {
        const roomListItem = document.getElementById(id);
        if (roomListItem)
        {
            roomListItem.remove();
        }
    }

    private updateRoomInList(info: NewRoomNameInfo): void
    {
        const roomListItem = document.getElementById(info.id) as HTMLAnchorElement | undefined;
        if (roomListItem)
        {
            roomListItem.innerText = info.name;
        }
    }

    private onDisconnect(): void
    {
        console.warn("Вы были отсоединены от веб-сервера (websocket disconnect)");
    }
}