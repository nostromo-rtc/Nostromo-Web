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

            this.generalSocket.on(SE.RoomDeleted, (roomId: string) =>
            {
                this.roomDeleted(roomId);
            });

            this.generalSocket.on(SE.RoomCreated, (info: RoomLinkInfo) =>
            {
                this.roomCreated(info);
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

            const btn_changeUsername = document.getElementById("btn_changeUsername") as HTMLButtonElement;
            const usernameInput = document.getElementById("usernameInput") as HTMLInputElement;
            btn_changeUsername.addEventListener('click', () =>
            {
                usernameInput.value = usernameInput.value.trim();
                if (userSelect.value != "default"
                    && usernameInput.value.length > 0)
                {
                    this.changeUsername(userSelect.value, usernameInput.value);
                }
            });

            const btn_banUser = document.getElementById("btn_banUser") as HTMLButtonElement;
            btn_banUser.addEventListener("click", () =>
            {
                if (userSelect.value != "default")
                {
                    if (confirm("Вы уверены что хотите заблокировать выбранного пользователя?"))
                    {
                        this.banUser(userSelect.value);
                    }
                }
            });

            const ipInput = document.getElementById("ip-input") as HTMLInputElement;
            const btn_banUserByIp = document.getElementById("btn_banUserByIp") as HTMLButtonElement;
            btn_banUserByIp.addEventListener('click', () =>
            {
                ipInput.value = ipInput.value.trim();
                if (ipInput.value.length > 0)
                {
                    this.banUserByIp(ipInput.value);
                }
            });
            const btn_unbanUserByIp = document.getElementById("btn_unbanUserByIp") as HTMLButtonElement;
            btn_unbanUserByIp.addEventListener('click', () =>
            {
                ipInput.value = ipInput.value.trim();
                if (ipInput.value.length > 0)
                {
                    this.unbanUserByIp(ipInput.value);
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
    }

    private roomCreated(info: RoomLinkInfo): void
    {
        this.addRoomListItem(info);
    }

    private roomDeleted(roomId: string): void
    {
        const roomSelect = document.getElementById('roomSelect') as HTMLSelectElement;
        const selectedRoomId = roomSelect.item(roomSelect.selectedIndex)?.value;
        if (selectedRoomId && selectedRoomId == roomId)
        {
            const userSelect = document.getElementById('userSelect') as HTMLSelectElement;
            userSelect.length = 0;
        }

        this.removeRoomListItem(roomId);
    }

    private deleteRoom(): void
    {
        const roomSelect = (document.getElementById('roomSelect') as HTMLSelectElement);
        const roomId = roomSelect.value;
        if (roomId && roomId != "default")
        {
            this.socket.emit(SE.DeleteRoom, roomId);
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

    /** Добавить комнату в список комнат. */
    private addRoomListItem(info: RoomLinkInfo): void
    {
        const roomSelect = document.getElementById('roomSelect') as HTMLSelectElement;
        const newOption = document.createElement('option');
        newOption.value = info.id;
        newOption.innerText = `[${info.id}] ${info.name}`;
        roomSelect.add(newOption);
    }

    /** Удалить комнату из списка комнат. */
    private removeRoomListItem(roomId: string): void
    {
        if (roomId && roomId != "default")
        {
            const option = document.querySelector(`option[value='${roomId}']`);
            if (option)
            {
                option.remove();
            }
        }
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

    /** Изменить имя пользователя. */
    private changeUsername(id: string, name: string)
    {
        const userInfo: UserInfo = { id, name };
        this.socket.emit(SE.ChangeUsername, userInfo);
    }

    /** Заблокировать пользователя комнаты userId на всём сервере. */
    private banUser(userId: string)
    {
        this.socket.emit(SE.BanUser, userId);
    }

    /** Заблокировать пользователя по IP. */
    private banUserByIp(userIp: string)
    {
        this.socket.emit(SE.BanUserByIp, userIp);
    }

    /** Разблокировать пользователя по IP. */
    private unbanUserByIp(userIp: string)
    {
        this.socket.emit(SE.UnbanUserByIp, userIp);
    }
}