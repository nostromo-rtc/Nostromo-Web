import { io, Socket } from "socket.io-client";
import { SocketEvents as SE } from "nostromo-shared/types/SocketEvents";

import { ActionOnUserInfo, ChangeUserNameInfo, NewRoomInfo, NewRoomNameInfo, NewRoomPassInfo } from "nostromo-shared/types/AdminTypes";
import { VideoCodec, UserInfo, PublicRoomInfo } from "nostromo-shared/types/RoomTypes";

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

    private roomInfoList = new Map<string, PublicRoomInfo>();

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

        if (this.onAuthPage())
        {
            this.handleAuthResultEv();
        }
        else
        {
            this.handleEvents();

            // Если комната какая-то выбрана, то сообщаем серверу,
            // что хотим получать список юзеров этой комнаты.
            this.subscribeUserList(this.getSelectedRoom());
            this.prepareVideoCodecSelect();
            this.handleRoomButtons();
            this.handleUserButtons();
        }
    }

    private handleAuthResultEv()
    {
        this.socket.on(SE.Result, (success: boolean) =>
        {
            if (success)
            {
                location.reload();
            }
            else
            {
                const result = document.getElementById('result') as HTMLParagraphElement;
                if (result)
                {
                    result.innerText = "Неправильный пароль!";
                }
            }
        });
    }

    private getSelectedRoom(): string
    {
        const roomSelect = document.getElementById('room-select') as HTMLSelectElement;
        return roomSelect.value;
    }

    private getSelectedUser(): string
    {
        const userSelect = document.getElementById('user-select') as HTMLSelectElement;
        return userSelect.value;
    }

    /** Обработка кнопок связанных с комнатами. */
    private handleRoomButtons()
    {
        // Обработка кнопки создания комнаты.
        const btn_createRoom = document.getElementById('btn-create-room')! as HTMLButtonElement;
        btn_createRoom.addEventListener('click', () =>
        {
            this.createRoom();
        });

        // Обработка кнопки удаления комнаты.
        const btn_deleteRoom = document.getElementById('btn-delete-room')! as HTMLButtonElement;
        btn_deleteRoom.addEventListener('click', () =>
        {
            this.deleteRoom(this.getSelectedRoom());
        });

        // Обработка кнопки изменения названия комнаты.
        const changeRoomNameInput = document.getElementById('change-room-name-input')! as HTMLInputElement;
        const btn_changeRoomName = document.getElementById('btn-change-room-name')! as HTMLButtonElement;
        btn_changeRoomName.addEventListener('click', () =>
        {
            const newName = changeRoomNameInput.value.trim();
            const info: NewRoomNameInfo = {
                id: this.getSelectedRoom(),
                name: newName
            };

            this.changeRoomName(info);
        });

        // Обработка кнопки изменения пароля комнаты.
        const changeRoomPassInput = document.getElementById('change-room-pass-input')! as HTMLInputElement;
        const btn_changeRoomPass = document.getElementById('btn-change-room-pass')! as HTMLButtonElement;
        btn_changeRoomPass.addEventListener('click', () =>
        {
            const newPass = changeRoomPassInput.value.trim();
            const info: NewRoomPassInfo = {
                id: this.getSelectedRoom(),
                password: newPass
            };

            this.changeRoomPass(info);
        });
    }

    private handleUserButtons()
    {
        // Обработка кнопки кика юзера.
        const btn_kickUser = document.getElementById("btn-kick-user") as HTMLButtonElement;
        btn_kickUser.addEventListener('click', () =>
        {
            const info: ActionOnUserInfo = {
                roomId: this.getSelectedRoom(),
                userId: this.getSelectedUser()
            };

            this.kickUser(info);
        });

        const btn_stopUserVideo = document.getElementById("btn-stop-user-video") as HTMLButtonElement;
        btn_stopUserVideo.addEventListener("click", () =>
        {
            const info: ActionOnUserInfo = {
                roomId: this.getSelectedRoom(),
                userId: this.getSelectedUser()
            };

            this.stopUserVideo(info);
        });

        const btn_stopUserAudio = document.getElementById("btn-stop-user-audio") as HTMLButtonElement;
        btn_stopUserAudio.addEventListener("click", () =>
        {
            const info: ActionOnUserInfo = {
                roomId: this.getSelectedRoom(),
                userId: this.getSelectedUser()
            };

            this.stopUserAudio(info);
        });

        const usernameInput = document.getElementById("user-name-input") as HTMLInputElement;

        const btn_changeUsername = document.getElementById("btn-change-user-name") as HTMLButtonElement;
        btn_changeUsername.addEventListener('click', () =>
        {
            usernameInput.value = usernameInput.value.trim();

            const info: ChangeUserNameInfo = {
                roomId: this.getSelectedRoom(),
                userId: this.getSelectedUser(),
                username: usernameInput.value
            };

            this.changeUsername(info);
        });

        const btn_banUser = document.getElementById("btn-ban-user") as HTMLButtonElement;
        btn_banUser.addEventListener("click", () =>
        {
            const info: ActionOnUserInfo = {
                roomId: this.getSelectedRoom(),
                userId: this.getSelectedUser()
            };

            this.banUser(info);
        });

        const ipInput = document.getElementById("ip-input") as HTMLInputElement;

        const btn_banUserByIp = document.getElementById("btn-ban-user-by-ip") as HTMLButtonElement;
        btn_banUserByIp.addEventListener('click', () =>
        {
            ipInput.value = ipInput.value.trim();
            this.banUserByIp(ipInput.value);
        });

        const btn_unbanUserByIp = document.getElementById("btn-unban-user-by-ip") as HTMLButtonElement;
        btn_unbanUserByIp.addEventListener('click', () =>
        {
            ipInput.value = ipInput.value.trim();
            this.unbanUserByIp(ipInput.value);
        });
    }

    private handleEvents()
    {
        this.handleRoomListEv();
        this.handleUserListEv();
        this.handleRoomDeletedEv();
        this.handleRoomCreatedEv();
        this.handleRoomNameChangedEv();
    }

    /** Обрабатываем событие получения начального списка комнат. */
    private handleRoomListEv()
    {
        this.socket.on(SE.RoomList, (roomList: PublicRoomInfo[]) =>
        {
            this.setInitialRoomList(roomList);
        });
    }

    /** Обрабатываем событие изменения списка юзеров в комнате. */
    private handleUserListEv()
    {
        this.generalSocket.on(SE.UserList, (userList: UserInfo[]) =>
        {
            this.setUserList(userList);
        });
    }

    /** Обрабатываем событие удаления комнаты. */
    private handleRoomDeletedEv()
    {
        this.generalSocket.on(SE.RoomDeleted, (roomId: string) =>
        {
            this.roomDeleted(roomId);
        });
    }

    /** Обрабатываем событие создания комнаты. */
    private handleRoomCreatedEv()
    {
        this.generalSocket.on(SE.RoomCreated, (info: PublicRoomInfo) =>
        {
            this.roomCreated(info);
        });
    }

    /** Обрабатываем событие изменения названия комнаты. */
    private handleRoomNameChangedEv()
    {
        this.generalSocket.on(SE.RoomNameChanged, (info: NewRoomNameInfo) =>
        {
            this.roomNameChanged(info);
        });
    }

    private prepareVideoCodecSelect(): void
    {
        this.videoCodecSelect = document.getElementById('video-codec')! as HTMLSelectElement;

        const Vp8Option = new Option(VideoCodec.VP8, VideoCodec.VP8);
        this.videoCodecSelect.add(Vp8Option);

        const Vp9Option = new Option(VideoCodec.VP9, VideoCodec.VP9, true);
        this.videoCodecSelect.add(Vp9Option);

        const H264Option = new Option(VideoCodec.H264, VideoCodec.H264);
        this.videoCodecSelect.add(H264Option);
    }

    private onAuthPage(): boolean
    {
        const joinButton = document.getElementById('btn-join');
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
        const name = (document.getElementById('room-name-input') as HTMLInputElement).value;
        const password = (document.getElementById('room-pass-input') as HTMLInputElement).value;
        const videoCodec = this.videoCodecSelect!.value as VideoCodec;

        const newRoomInfo: NewRoomInfo = {
            name,
            password,
            videoCodec
        };

        if (name.length > 0)
        {
            this.socket.emit(SE.CreateRoom, newRoomInfo);
        }
    }

    private roomCreated(info: PublicRoomInfo): void
    {
        this.addRoomListItem(info);
        this.roomInfoList.set(info.id, info);
    }

    private roomDeleted(roomId: string): void
    {
        if (this.getSelectedRoom() == roomId)
        {
            const userSelect = document.getElementById('user-select') as HTMLSelectElement;
            userSelect.length = 0;
        }

        this.removeRoomListItem(roomId);
        this.roomInfoList.delete(roomId);
    }

    private roomNameChanged(info: NewRoomNameInfo): void
    {
        const roomInfo = this.roomInfoList.get(info.id);

        if (roomInfo)
        {
            roomInfo.name = info.name;
            this.updateRoomListItem(roomInfo);
        }
    }

    private deleteRoom(roomId: string): void
    {
        if (this.checkIsSelectOptionCorrect(roomId))
        {
            this.socket.emit(SE.DeleteRoom, roomId);
        }
    }

    private setInitialRoomList(roomList: PublicRoomInfo[]): void
    {
        const roomSelect = document.getElementById('room-select') as HTMLSelectElement;
        for (const room of roomList)
        {
            const newOption = document.createElement('option');
            newOption.value = room.id;
            newOption.innerText = `[${room.id}, ${room.videoCodec}] ${room.name}`;

            roomSelect.add(newOption);

            this.roomInfoList.set(room.id, room);
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
        if (this.checkIsSelectOptionCorrect(roomId))
        {
            this.generalSocket.emit(SE.SubscribeUserList, roomId);
        }
    }

    /** Сообщаем серверу, что больше не хотим получать список юзеров этой комнаты. */
    private unsubscribeUserList(roomId: string): void
    {
        this.generalSocket.emit(SE.UnsubscribeUserList, roomId);
    }

    /** Присваиваем список юзеров. */
    private setUserList(userList: UserInfo[]): void
    {
        const userSelect = document.getElementById('user-select') as HTMLSelectElement;

        userSelect.length = 0;

        for (const user of userList)
        {
            const newOption = document.createElement('option');
            newOption.value = user.id;
            newOption.innerText = `${user.name} [${user.id}]`;

            userSelect.add(newOption);
        }
    }

    /** Добавить комнату в список комнат. */
    private addRoomListItem(info: PublicRoomInfo): void
    {
        const roomSelect = document.getElementById('room-select') as HTMLSelectElement;
        const newOption = document.createElement('option');
        newOption.value = info.id;
        newOption.innerText = `[${info.id}, ${info.videoCodec}] ${info.name}`;
        roomSelect.add(newOption);
    }

    /** Удалить комнату из списка комнат. */
    private removeRoomListItem(roomId: string): void
    {
        if (this.checkIsSelectOptionCorrect(roomId))
        {
            const option = document.querySelector(`option[value='${roomId}']`);
            if (option)
            {
                option.remove();
            }
        }
    }

    /** Обновить информацию о комнате в списке комнат. */
    private updateRoomListItem(info: PublicRoomInfo): void
    {
        const option = document.querySelector(`option[value='${info.id}']`) as HTMLOptionElement;
        if (option)
        {
            option.innerText = `[${info.id}, ${info.videoCodec}] ${info.name}`;
        }
    }

    /** Выгнать выбранного пользователя из комнаты. */
    private kickUser(info: ActionOnUserInfo)
    {
        if (this.checkIsSelectOptionCorrect(info.roomId)
            && this.checkIsSelectOptionCorrect(info.userId))
        {
            this.socket.emit(SE.KickUser, info);
        }
    }

    /** Прекратить захват видео у пользователя. */
    private stopUserVideo(info: ActionOnUserInfo)
    {
        if (this.checkIsSelectOptionCorrect(info.roomId)
            && this.checkIsSelectOptionCorrect(info.userId))
        {
            this.socket.emit(SE.StopUserVideo, info);
        }
    }

    /** Прекратить захват аудио у пользователя. */
    private stopUserAudio(info: ActionOnUserInfo)
    {
        if (this.checkIsSelectOptionCorrect(info.roomId)
            && this.checkIsSelectOptionCorrect(info.userId))
        {
            this.socket.emit(SE.StopUserAudio, info);
        }
    }

    /** Изменить имя пользователя. */
    private changeUsername(info: ChangeUserNameInfo)
    {
        if (this.checkIsSelectOptionCorrect(info.roomId)
            && this.checkIsSelectOptionCorrect(info.userId)
            && info.username.length > 0)
        {
            this.socket.emit(SE.ChangeUsername, info);
        }
    }

    /** Заблокировать пользователя комнаты userId на всём сервере. */
    private banUser(info: ActionOnUserInfo)
    {
        if (this.checkIsSelectOptionCorrect(info.roomId)
            && this.checkIsSelectOptionCorrect(info.userId)
            && confirm("Вы уверены что хотите заблокировать выбранного пользователя?"))
        {
            this.socket.emit(SE.BanUser, info);
        }
    }

    /** Заблокировать пользователя по IP. */
    private banUserByIp(userIp: string)
    {
        if (userIp.length > 0)
        {
            this.socket.emit(SE.BanUserByIp, userIp);
        }
    }

    /** Разблокировать пользователя по IP. */
    private unbanUserByIp(userIp: string)
    {
        if (userIp.length > 0)
        {
            this.socket.emit(SE.UnbanUserByIp, userIp);
        }
    }

    /** Изменить название комнаты. */
    private changeRoomName(info: NewRoomNameInfo)
    {
        if (this.checkIsSelectOptionCorrect(info.id) && info.name.length > 0)
        {
            this.socket.emit(SE.ChangeRoomName, info);
        }
    }

    /** Изменить пароль комнаты. */
    private changeRoomPass(info: NewRoomPassInfo)
    {
        if (this.checkIsSelectOptionCorrect(info.id))
        {
            this.socket.emit(SE.ChangeRoomPass, info);
        }
    }

    private checkIsSelectOptionCorrect(id: string): boolean
    {
        if (id == "default" || id == "")
        {
            return false;
        }
        return true;
    }
}