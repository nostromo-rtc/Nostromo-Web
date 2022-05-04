import { io, Socket } from "socket.io-client";
import { SocketEvents as SE } from "nostromo-shared/types/SocketEvents";

import { ActionOnUserInfo, ChangeUserNameInfo, NewRoomInfo, NewRoomNameInfo, NewRoomPassInfo, NewRoomSaveChatPolicyInfo } from "nostromo-shared/types/AdminTypes";
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

        // Обработка событий.
        this.handleEvents();

        // Если комната какая-то выбрана, то сообщаем серверу,
        // что хотим получать список юзеров этой комнаты.
        this.subscribeUserList(this.getSelectedRoom());

        // Подготовка опций выбора кодека.
        this.prepareVideoCodecSelect();

        // Обработка кнопок.
        this.handleRoomButtons();
        this.handleUserButtons();
    }

    /** Отдать Id выбранной комнаты. */
    private getSelectedRoom(): string
    {
        const roomSelect = document.getElementById('room-select') as HTMLSelectElement;
        return roomSelect.value;
    }

    /** Отдать Id выбранного пользователя. */
    private getSelectedUser(): string
    {
        const userSelect = document.getElementById('user-select') as HTMLSelectElement;
        return userSelect.value;
    }

    /** Отдать выбранные Id комнаты и пользователя. */
    private getSelectedActionOnUserInfo(): ActionOnUserInfo
    {
        const info: ActionOnUserInfo = {
            roomId: this.getSelectedRoom(),
            userId: this.getSelectedUser()
        };

        return info;
    }

    /** Обработка кнопок связанных с комнатами. */
    private handleRoomButtons(): void
    {
        // Обработка кнопки создания комнаты.
        const btn_createRoom = document.getElementById('btn-create-room')! as HTMLButtonElement;
        btn_createRoom.addEventListener('click', this.createRoom);

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

        // Очистка истории чата комнаты.
        const btn_clearRoomChat = document.getElementById("btn-clear-room-chat") as HTMLButtonElement;
        btn_clearRoomChat.addEventListener("click", () =>
        {
            this.clearRoomChat(this.getSelectedRoom());
        });

        // Удалить все файлы, привязанные к комнате.
        const btn_deleteRoomFiles = document.getElementById("btn-delete-room-files") as HTMLButtonElement;
        btn_deleteRoomFiles.addEventListener("click", () =>
        {
            this.deleteRoomFiles(this.getSelectedRoom());
        });

        // Сохранять историю чата.
        const btn_saveRoomChatPolicy = document.getElementById("btn-save-room-chat-policy") as HTMLButtonElement;
        btn_saveRoomChatPolicy.addEventListener("click", () =>
        {
            const info: NewRoomSaveChatPolicyInfo = {
                id: this.getSelectedRoom(),
                saveChatPolicy: true
            };

            this.setSaveRoomChatPolicy(info);
        });

        // Не сохранять историю чата.
        const btn_dontSaveRoomChatPolicy = document.getElementById("btn-dont-save-room-chat-policy") as HTMLButtonElement;
        btn_dontSaveRoomChatPolicy.addEventListener("click", () =>
        {
            const info: NewRoomSaveChatPolicyInfo = {
                id: this.getSelectedRoom(),
                saveChatPolicy: false
            };

            this.setSaveRoomChatPolicy(info);
        });
    }

    /** Обработка кнопок, связанных с пользователем. */
    private handleUserButtons(): void
    {
        // Кик юзера.
        const btn_kickUser = document.getElementById("btn-kick-user") as HTMLButtonElement;
        btn_kickUser.addEventListener('click', () =>
        {
            this.kickUser(this.getSelectedActionOnUserInfo());
        });

        // Остановить демонстрацию экрана.
        const btn_stopUserDisplay = document.getElementById("btn-stop-user-display") as HTMLButtonElement;
        btn_stopUserDisplay.addEventListener("click", () =>
        {
            this.stopUserDisplay(this.getSelectedActionOnUserInfo());
        });

        // Выключить вебки пользователя (прекратить захват видеоустройств).
        const btn_stopUserCam = document.getElementById("btn-stop-user-cam") as HTMLButtonElement;
        btn_stopUserCam.addEventListener("click", () =>
        {
            this.stopUserCam(this.getSelectedActionOnUserInfo());
        });

        // Прекратить захват микрофона.
        const btn_stopUserAudio = document.getElementById("btn-stop-user-audio") as HTMLButtonElement;
        btn_stopUserAudio.addEventListener("click", () =>
        {
            this.stopUserAudio(this.getSelectedActionOnUserInfo());
        });

        // Ограничение по длине имени пользователя.
        const usernameInput = document.getElementById("user-name-input") as HTMLInputElement;
        usernameInput.maxLength = 32;

        // Смена ника юзера.
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

        // Бан юзера.
        const btn_banUser = document.getElementById("btn-ban-user") as HTMLButtonElement;
        btn_banUser.addEventListener("click", () =>
        {
            this.banUser(this.getSelectedActionOnUserInfo());
        });

        // Бан юзера по IP.
        const ipInput = document.getElementById("ip-input") as HTMLInputElement;
        const btn_banUserByIp = document.getElementById("btn-ban-user-by-ip") as HTMLButtonElement;
        btn_banUserByIp.addEventListener('click', () =>
        {
            ipInput.value = ipInput.value.trim();
            this.banUserByIp(ipInput.value);
        });

        // Разбан юзера по IP.
        const btn_unbanUserByIp = document.getElementById("btn-unban-user-by-ip") as HTMLButtonElement;
        btn_unbanUserByIp.addEventListener('click', () =>
        {
            ipInput.value = ipInput.value.trim();
            this.unbanUserByIp(ipInput.value);
        });
    }

    /** Обработка сокет событий. */
    private handleEvents()
    {
        this.socket.on(SE.RoomList, this.setInitialRoomList);
        this.generalSocket.on(SE.UserList, this.setUserList);
        this.generalSocket.on(SE.RoomDeleted, this.roomDeleted);
        this.generalSocket.on(SE.RoomCreated, this.roomCreated);
        this.generalSocket.on(SE.RoomNameChanged, this.roomNameChanged);
    }

    /** Подготовить опции выбора кодека. */
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

    /** Создать комнату. */
    private createRoom = (): void =>
    {
        const name = (document.getElementById('room-name-input') as HTMLInputElement).value;
        const password = (document.getElementById('room-pass-input') as HTMLInputElement).value;
        const videoCodec = this.videoCodecSelect!.value as VideoCodec;
        const saveChatPolicy = (document.getElementById('checkbox-save-room-chat-policy') as HTMLInputElement).checked;

        const newRoomInfo: NewRoomInfo = {
            name,
            password,
            videoCodec,
            saveChatPolicy
        };

        if (name.length > 0)
        {
            this.socket.emit(SE.CreateRoom, newRoomInfo);
        }
    };

    /** Обрабатываем событие создания комнаты. */
    private roomCreated = (info: PublicRoomInfo): void =>
    {
        this.addRoomListItem(info);
        this.roomInfoList.set(info.id, info);
    };

    /** Обрабатываем событие удаления комнаты. */
    private roomDeleted = (roomId: string): void =>
    {
        if (this.getSelectedRoom() == roomId)
        {
            const userSelect = document.getElementById('user-select') as HTMLSelectElement;
            userSelect.length = 0;
        }

        this.removeRoomListItem(roomId);
        this.roomInfoList.delete(roomId);
    };

    /** Обрабатываем событие изменения названия комнаты. */
    private roomNameChanged = (info: NewRoomNameInfo): void =>
    {
        const roomInfo = this.roomInfoList.get(info.id);

        if (roomInfo)
        {
            roomInfo.name = info.name;
            this.updateRoomListItem(roomInfo);
        }
    };

    /** Удалить комнату. */
    private deleteRoom(roomId: string): void
    {
        if (this.checkIsSelectOptionCorrect(roomId)
            && confirm("Вы уверены что хотите удалить выбранную комнату?"))
        {
            this.socket.emit(SE.DeleteRoom, roomId);
        }
    }

    /** Очистить историю чата. */
    private clearRoomChat(roomId: string): void
    {
        if (this.checkIsSelectOptionCorrect(roomId))
        {
            this.socket.emit(SE.ClearRoomChat, roomId);
        }
    }

    /** Удалить все файлы комнаты. */
    private deleteRoomFiles(roomId: string): void
    {
        if (this.checkIsSelectOptionCorrect(roomId))
        {
            this.socket.emit(SE.DeleteRoomFiles, roomId);
        }
    }

    /** Обрабатываем событие получения начального списка комнат. */
    private setInitialRoomList = (roomList: PublicRoomInfo[]): void =>
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
    };

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
    private setUserList = (userList: UserInfo[]): void =>
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
    };

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

    /** Прекратить захват экрана у пользователя. */
    private stopUserDisplay(info: ActionOnUserInfo)
    {
        if (this.checkIsSelectOptionCorrect(info.roomId)
            && this.checkIsSelectOptionCorrect(info.userId))
        {
            this.socket.emit(SE.StopUserDisplay, info);
        }
    }

    /** Прекратить захват видеоустройств у пользователя. */
    private stopUserCam(info: ActionOnUserInfo)
    {
        if (this.checkIsSelectOptionCorrect(info.roomId)
            && this.checkIsSelectOptionCorrect(info.userId))
        {
            this.socket.emit(SE.StopUserCam, info);
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

    /** Проверка правильности выбранной опции. */
    private checkIsSelectOptionCorrect(id: string): boolean
    {
        return (id != "default" && id != "");
    }

    /** Установить параметр сохранения истории чата на сервере. */
    private setSaveRoomChatPolicy(info: NewRoomSaveChatPolicyInfo)
    {
        if (this.checkIsSelectOptionCorrect(info.id))
        {
            this.socket.emit(SE.ChangeRoomSaveChatPolicy, info);
        }
    }
}