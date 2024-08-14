/*
    SPDX-FileCopyrightText: 2023-2024 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import React, { useRef, useState } from "react";

import { List } from "../../Base/List/List";
import { ListItemButton, ListItemInput, ListItemSelect, ListItemSwitch } from "../../Base/List/ListItems";
import { VideoCodec } from "../../../services/RoomService";
import { NumericConstants as NC } from "../../../utils/NumericConstants";

export const CreateRoom: React.FC = () =>
{
    // Название новой комнаты
    const [roomName, setRoomName] = useState<string>("");

    // Пароль новой комнаты
    const [roomPassword, setRoomPassword] = useState<string>("");

    // Видеокодек для комнаты
    const [roomCodec, setRoomCodec] = useState<string>("VP8");

    // Сохранять историю чата?
    const [saveHistory, setSaveHistory] = useState<boolean>(true);

    // Симметричный режим?
    const [symmetricalMode, setSymmetricalMode] = useState<boolean>(true);

    // Ссылка на кнопку для фокуса (чтобы можно было нажать клавиатурой)
    const createBtnRef = useRef<HTMLButtonElement>(null);

    const handleCreateRoom = (): void =>
    {
        console.log("Данные новой комнаты: ");
        console.log("Name: ", roomName);
        console.log("Password: ", roomPassword);
        console.log("Codec: ", roomCodec);
        console.log("Save History ? ", saveHistory);
        console.log("Symmetrical mode ? ", symmetricalMode);
    };

    const videoCodecs: string[] = Object.values(VideoCodec);

    return (
        <List className="flex-auto">
            <p className="admin-panel-category-label">Создание комнаты</p>
            <ListItemInput
                label="Название комнаты"
                description="Введите название новой комнаты. Вы сможете изменить название даже после создания комнаты."
                value={roomName}
                onValueChange={setRoomName}
                tabIndex={NC.ZERO_TAB_IDX}
            />
            <ListItemInput
                label="Пароль комнаты"
                description="Введите пароль для новой комнаты.
                Вы также можете оставить данное поле пустым, если пароль не требуется. Вы сможете изменить пароль даже после создания комнаты."
                value={roomPassword}
                onValueChange={setRoomPassword}
                password={true}
            />
            <ListItemSelect
                label="Видеокодек для комнаты"
                description="В большинстве случаев кодек VP8 является наиболее подходящим,
                но VP9 теоретически должен предоставлять наилучшее качество.
                Учтите, что после создания комнаты вы не сможете поменять данный параметр."
                value={roomCodec}
                onValueChange={setRoomCodec}
                options={videoCodecs}
            />
            <ListItemSwitch
                label="Сохранять историю чата"
                description="Необходимо ли сохранять историю сообщений в чате комнаты?
                Вы сможете поменять этот параметр в любой момент после создания комнаты."
                value={saveHistory}
                onValueChange={setSaveHistory}
            />
            <ListItemSwitch
                label="Симметричный режим"
                description="Этот параметр позволяет установить симметричный режим конференции, в противном случае - режим докладчика.
                В симметричном режиме все участники могут передавать медиапотоки (аудио и видео), а в режиме докладчика - только те участники,
                которые были назначены администратором в качестве докладчиков. Вы сможете поменять этот параметр в любой момент после создания комнаты."
                value={symmetricalMode}
                onValueChange={setSymmetricalMode}
            />
            <ListItemButton
                btnRef={createBtnRef}
                showSeparator={false}
                btnLabel="Создать комнату"
                onBtnClick={handleCreateRoom}
            />
        </List>
    );
};
