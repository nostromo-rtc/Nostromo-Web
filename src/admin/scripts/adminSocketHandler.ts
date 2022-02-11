import { io, Socket } from "socket.io-client";

import { NewRoomInfo } from "nostromo-shared/types/AdminTypes";
import { VideoCodec } from "nostromo-shared/types/RoomTypes";

type Room = {
    id: string,
    name: string;
};

type User = {
    id: string,
    name: string;
};

// Класс для работы с сокетами при авторизации в панель администратора
export default class adminSocketHandler
{
    private socket: Socket = io(`/admin`, {
        'transports': ['websocket']
    });
    private latestRoomId = 0;

    private videoCodecSelect?: HTMLSelectElement;

    constructor()
    {
        console.debug("adminSocketHandler ctor");
        this.socket.on('connect', () =>
        {
            console.info("Создано подключение веб-сокета");
            console.info("Client ID:", this.socket.id);
        });

        this.socket.on('connect_error', (err: Error) =>
        {
            console.log(err.message);
        });

        this.socket.on('result', (success: boolean) =>
        {
            if (success) location.reload();
            else
            {
                const result = document.getElementById('result') as HTMLParagraphElement;
                if (result) result.innerText = "Неправильный пароль!";
            }
        });

        if (!this.onAuthPage())
        {
            this.socket.on('roomList', (roomList: Room[], roomIndex: number) =>
            {
                this.setRoomList(roomList);
                this.latestRoomId = roomIndex;
            });

            // Привязываемся к событию изменения списка юзеров.
            this.socket.on('userList', (userList: User[]) =>
            {
                this.setUserList(userList);
            });

            // Если комната какая-то выбрана, то сообщаем серверу,
            // что хотим получать список юзеров этой комнаты.
            const roomSelect = document.getElementById('roomSelect') as HTMLSelectElement;
            const selectedRoomOption = roomSelect.item(roomSelect.selectedIndex);
            if (selectedRoomOption && selectedRoomOption.value != "default")
            {
                this.getUserList(selectedRoomOption.value);
            }

            this.prepareVideoCodecSelect();

            const btn_createRoom = document.getElementById('btn_createRoom')! as HTMLButtonElement;
            const btn_deleteRoom = document.getElementById('btn_deleteRoom')! as HTMLButtonElement;
            btn_createRoom.addEventListener('click', () => { this.createRoom(); });
            btn_deleteRoom.addEventListener('click', () => { this.deleteRoom(); });
        }
    }

    private prepareVideoCodecSelect()
    {
        this.videoCodecSelect = document.getElementById('videoCodec')! as HTMLSelectElement;

        const Vp9Option = new Option(VideoCodec.VP9, VideoCodec.VP9, true);
        this.videoCodecSelect.add(Vp9Option);

        const Vp8Option = new Option(VideoCodec.VP8, VideoCodec.VP8);
        this.videoCodecSelect.add(Vp8Option);

        const H264Option = new Option(VideoCodec.H264, VideoCodec.H264);
        this.videoCodecSelect.add(H264Option);
    }

    private onAuthPage(): boolean
    {
        const joinButton = document.getElementById('btn_join');
        if (joinButton)
        {
            const passInput = document.getElementById('pass')! as HTMLInputElement;

            joinButton.addEventListener('click', () =>
            {
                this.socket.emit('joinAdmin', passInput.value);
            });

            passInput.addEventListener('keydown', (e) =>
            {
                if (e.key == 'Enter' && !e.shiftKey)
                {
                    e.preventDefault();
                    joinButton.click();
                }
            });

            return true;
        }
        return false;
    }

    private createRoom(): void
    {
        const name = (document.getElementById('roomNameInput') as HTMLInputElement).value;
        const pass = (document.getElementById('roomPassInput') as HTMLInputElement).value;
        const videoCodec = this.videoCodecSelect!.value as VideoCodec;

        const newRoomInfo: NewRoomInfo = {
            name,
            pass,
            videoCodec
        };

        this.socket.emit('createRoom', newRoomInfo);
        this.addRoomListItem(name);

        const roomLink = document.getElementById('roomLink') as HTMLInputElement;
        if (roomLink.hidden) roomLink.hidden = false;
        roomLink.value = `${window.location.origin}/rooms/${this.latestRoomId}?p=${pass}`;
    }

    private deleteRoom(): void
    {
        const roomSelect = (document.getElementById('roomSelect') as HTMLSelectElement);
        const roomId = roomSelect.value;
        if (roomId && roomId != "default")
        {
            this.socket.emit('deleteRoom', roomId);
            const option = document.querySelector(`option[value='${roomId}']`);
            if (option)
            {
                option.remove();
            }
        }
    }

    private setRoomList(roomList: Room[]): void
    {
        const roomSelect = document.getElementById('roomSelect') as HTMLSelectElement;
        for (const room of roomList)
        {
            const newOption = document.createElement('option');
            newOption.value = room['id'];
            newOption.innerText = `[${room['id']}] ${room['name']}`;

            roomSelect.add(newOption);
        }

        roomSelect.addEventListener('change', () =>
        {
            const selectedRoomOption = roomSelect.item(roomSelect.selectedIndex);
            if (selectedRoomOption)
            {
                this.getUserList(selectedRoomOption.value);
            }
        });
    }

    /** Сообщаем серверу, что хотим получать список юзеров этой комнаты. */
    private getUserList(roomId: string): void
    {
        console.log("emit");
        this.socket.emit('userList', roomId);
    }

    /** Присваиваем список юзеров. */
    private setUserList(userList: User[]): void
    {
        const userSelect = document.getElementById('userSelect') as HTMLSelectElement;

        userSelect.length = 0;

        for (const user of userList)
        {
            const newOption = document.createElement('option');
            newOption.value = user['id'];
            newOption.innerText = `${user['name']} [${user['id']}]`;

            userSelect.add(newOption);
        }
    }

    private addRoomListItem(roomName: string): void
    {
        const roomSelect = document.getElementById('roomSelect') as HTMLSelectElement;
        const id = ++this.latestRoomId;
        const newOption = document.createElement('option');
        newOption.value = id.toString();
        newOption.innerText = `[${id}] ${roomName}`;
        roomSelect.add(newOption);
    }
}