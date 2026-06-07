/*
    SPDX-FileCopyrightText: 2022-2026 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import "../App.css";
import "./AdminAuthPage.css";

import React, { ChangeEventHandler, KeyboardEventHandler, useEffect, useState } from "react";

import { Input } from "../components/Base/Input";
import { Header } from "../components/Header";
import { useAuth } from "../hooks/UseAuth";

const ZERO = 0;
const ONE = 1;

export const AdminAuthPage: React.FC = () =>
{
    const path = `/api/admin`;
    const [password, setPassword] = useState("");
    const [finishPassword, setFinishPassword] = useState("");
    const [falseAuthCound, setFalseAuthCount] = useState<number>(ZERO);

    const auth = useAuth(path, finishPassword);

    const handleSubmitPassword = (): void =>
    {
        setFinishPassword(password);
    };

    const handleInputChange: ChangeEventHandler<HTMLInputElement> = (ev) =>
    {
        setPassword(ev.target.value);
    };

    const handleInputKeyDown: KeyboardEventHandler<HTMLInputElement> = (ev) =>
    {
        if (ev.code === "Enter" && !ev.shiftKey)
        {
            ev.preventDefault();
            handleSubmitPassword();
        }
    };

    // Increase false auth count
    useEffect(() =>
    {
        if (auth === "false")
        {
            setFalseAuthCount(prev => prev + ONE);
        }
    }, [auth]);

    useEffect(() =>
    {
        document.title = `Nostromo - Режим администратора`;
    }, []);

    const formComponent = (
        <div id="auth">
            {falseAuthCound > ONE ? <span className="m-a" id="status">Неправильный пароль!</span> : <></>}
            <span className="m-a">Авторизация</span>
            <span className="m-a" id="title-name" title="Режим администратора">Режим администратора</span>
            <Input
                id="pass"
                password={true}
                placeholder="Введите пароль"
                value={password}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
            />
            <input id="btn-join" type="submit" value="Войти" onClick={handleSubmitPassword} />
        </div>
    );

    return (
        <>
            <Header title={`Авторизация (режим администратора)`} />
            <div id="main">
                {auth === "true"
                    ? <span className="m-a" id="success-message">Вы авторизованы как администратор!</span>
                    : formComponent}
            </div>
        </>
    );
};
