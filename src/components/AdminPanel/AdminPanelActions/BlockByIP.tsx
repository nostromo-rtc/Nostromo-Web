/*
    SPDX-FileCopyrightText: 2023-2024 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import React, { ChangeEventHandler, useRef, useState } from "react";

import { Button } from "@mui/material";
import { Input } from "../../Base/Input";

import "./BlockByIP.css";

export const BlockByIP: React.FC = () =>
{
    const [ip, setIp] = useState<string>("");

    const inputRef = useRef<HTMLInputElement>(null);

    const handleBlock = (): void =>
    {
        console.log("Заблокировать пользователя с IP: ", ip);
    };

    const handleUnblock = (): void =>
    {
        console.log("Разблокировать пользователя с IP: ", ip);
    };

    const handleInputAreaClick = (): void =>
    {
        inputRef.current?.focus();
    };

    const handleInputChange: ChangeEventHandler<HTMLInputElement> = (ev) =>
    {
        setIp(ev.target.value);
    };

    const ipInputDesc = "Введите IP-адрес в поле для ввода для того, чтобы заблокировать или разблокировать пользователя по IP-адресу.";

    return (
        <div id="block-by-ip-area">
            <div id="block-by-ip-input-area" onClick={handleInputAreaClick}>
                <span className="text-wrap">IP - адрес</span>
                <Input className="input" ref={inputRef} value={ip} onChange={handleInputChange} />
                <p className="list-item-description">{ipInputDesc}</p>
            </div>
            <div id="block-by-ip-button-area">
                <Button className="block-by-ip-button"
                    variant="contained"
                    color="error"
                    onClick={handleBlock}
                >
                    Заблокировать
                </Button>
                <Button className="block-by-ip-button"
                    variant="contained"
                    color="primary"
                    onClick={handleUnblock}
                >
                    Разблокировать
                </Button>
            </div>
        </div>
    );
};
