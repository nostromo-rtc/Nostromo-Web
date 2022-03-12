import { io, Socket } from "socket.io-client";
import { SocketEvents as SE } from "nostromo-shared/types/SocketEvents";

import { NewRoomInfo, RoomLinkInfo } from "nostromo-shared/types/AdminTypes";
import { VideoCodec, UserInfo } from "nostromo-shared/types/RoomTypes";

// Класс для работы с сокетами при авторизации в панель администратора
export default class AdminSocketService
{
    private socket: Socket = io(`/admin`, {
        'transports': ['websocket']
    });

    private generalSocket: Socket = io(`/`, {
        'transports': ['websocket']
    });

    private videoCodecSelect?: HTMLSelectElement;

    private latestSubscribedRoomId: string | undefined;

    constructor()
    {
        console.debug("AdminSocketService ctor");
        this.socket.on('connect', () =>
        {
            console.info("Создано подключение веб-сокета");
            console.info("Client ID:", this.socket.id);
        });

        this.socket.on('connect_error', (err: Error) =>
        {
            console.log(err.message);
        });

        this.socket.on(SE.Result, (success: boolean) =>
        {
            if (success)
            {
                location.reload();
            }
            else
            {
                const result = document.getElementById('result') as HTMLParagraphElement;
                if (result) result.innerText = "Неправильный пароль!";
            }
        });

        if (!this.onAuthPage())
        {
            this.socket.on(SE.RoomList, (roomList: RoomLinkInfo[]) =>
            {
                this.setRoomList(roomList);
            });

            // Привязываемся к событию изменения списка юзеров.
            this.generalSocket.on(SE.UserList, (userList: UserInfo[]) =>
            {
                this.setUserList(userList);
            });

            // Если комната какая-то выбрана, то сообщаем серверу,
            // что хотим получать список юзеров этой комнаты.
            const roomSelect = document.getElementById('roomSelect') as HTMLSelectElement;
            const selectedRoomOption = roomSelect.item(roomSelect.selectedIndex);
            if (selectedRoomOption && selectedRoomOption.value != "default")
            {
                this.subscribeUserList(selectedRoomOption.value);
            }

            this.prepareVideoCodecSelect();

            const btn_createRoom = document.getElementById('btn_createRoom')! as HTMLButtonElement;
            const btn_deleteRoom = document.getElementById('btn_deleteRoom')! as HTMLButtonElement;
            btn_createRoom.addEventListener('click', () => { this.createRoom(); });
            btn_deleteRoom.addEventListener('click', () => { this.deleteRoom(); });

            const userSelect = document.getElementById('userSelect') as HTMLSelectElement;
            const btn_kickUser = document.getElementById("btn_kickUser") as HTMLButtonElement;
            btn_kickUser.addEventListener('click', () =>
            {
                if (userSelect.value != "default")
                {
                    this.kickUser(userSelect.value);
                }
            });

            const btn_stopUserVideo = document.getElementById("btn_stopUserVideo") as HTMLButtonElement;
            btn_stopUserVideo.addEventListener("click", () =>
            {
                if (userSelect.value != "default")
                {
                    this.stopUserVideo(userSelect.value);
                }
            });

            const btn_stopUserAudio = document.getElementById("btn_stopUserAudio") as HTMLButtonElement;
            btn_stopUserAudio.addEventListener("click", () =>
            {
                if (userSelect.value != "default")
                {
                    this.stopUserAudio(userSelect.value);
                }
            });
        }
    }

    private prepareVideoCodecSelect(): void
    {
        this.videoCodecSelect = document.getElementById('videoCodec')! as HTMLSelectElement;

        const Vp8Option = new Option(VideoCodec.VP8, VideoCodec.VP8);
        this.videoCodecSelect.add(Vp8Option);

        const Vp9Option = new Option(VideoCodec.VP9, VideoCodec.VP9, true);
        this.videoCodecSelect.add(Vp9Option);

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
                this.socket.emit(SE.AdminAuth, passInput.value);
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

        this.socket.emit(SE.CreateRoom, newRoomInfo);

        this.socket.once(SE.RoomCreated, (info: RoomLinkInfo) =>
        {
            this.roomCreated(info, pass);
        });
    }

    private roomCreated(info: RoomLinkInfo, pass: string): void
    {
        this.addRoomListItem(info);

        const roomLink = document.getElementById('roomLink') as HTMLInputElement;
        if (roomLink.hidden)
        {
            roomLink.hidden = false;
        }
        roomLink.value = `${window.location.origin}/rooms/${info.id}?p=${pass}`;
    }

    private deleteRoom(): void
    {
        const roomSelect = (document.getElementById('roomSelect') as HTMLSelectElement);
        const roomId = roomSelect.value;
        if (roomId && roomId != "default")
        {
            this.socket.emit(SE.DeleteRoom, roomId);
            const option = document.querySelector(`option[value='${roomId}']`);
            if (option)
            {
                option.remove();
            }
        }
    }

    private setRoomList(roomList: RoomLinkInfo[]): void
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
                // Отписываемся от предыдущей комнаты.
                if (this.latestSubscribedRoomId)
                {
                    this.unsubscribeUserList(this.latestSubscribedRoomId);
                }

                const roomId = selectedRoomOption.value;
                this.subscribeUserList(roomId);
                this.latestSubscribedRoomId = roomId;
            }
        });
    }

    /** Сообщаем серверу, что хотим получать список юзеров этой комнаты. */
    private subscribeUserList(roomId: string): void
    {
        this.generalSocket.emit(SE.SubscribeUserList, roomId);
    }

    /** Сообщаем серверу, что больше не хотим получать список юзеров этой комнаты. */
    private unsubscribeUserList(roomId: string): void
    {
        this.generalSocket.emit(SE.UnsubscribeUserList, roomId);
    }

    /** Присваиваем список юзеров. */
    private setUserList(userList: RoomLinkInfo[]): void
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

    private addRoomListItem(info: RoomLinkInfo): void
    {
        const roomSelect = document.getElementById('roomSelect') as HTMLSelectElement;
        const newOption = document.createElement('option');
        newOption.value = info.id;
        newOption.innerText = `[${info.id}] ${info.name}`;
        roomSelect.add(newOption);
    }

    /** Выгнать выбранного пользователя из комнаты. */
    private kickUser(userId: string)
    {
        this.socket.emit(SE.KickUser, userId);
    }

    /** Прекратить захват видео у пользователя. */
    private stopUserVideo(userId: string)
    {
        this.socket.emit(SE.StopUserVideo, userId);
    }

    /** Прекратить захват аудио у пользователя. */
    private stopUserAudio(userId: string)
    {
        this.socket.emit(SE.StopUserAudio, userId);
    }
}