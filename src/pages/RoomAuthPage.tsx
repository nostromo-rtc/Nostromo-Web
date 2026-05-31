import "../App.css";
import "./RoomAuthPage.css";

import React, { ChangeEventHandler, KeyboardEventHandler, useEffect, useState } from "react";

import { Input } from "../components/Base/Input";
import { Header } from "../components/Header";

interface RoomAuthPageParams
{
    errorAuthStatus: boolean;
    roomName: string;
    onSubmitPassword: (password: string) => void;
}

export const RoomAuthPage: React.FC<RoomAuthPageParams> = ({ errorAuthStatus, roomName, onSubmitPassword }) =>
{
    const [password, setPassword] = useState("");

    const handleJoinClick = (): void =>
    {
        onSubmitPassword(password);
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
            handleJoinClick();
        }
    };

    const formComponent = (
        <div id="auth">
            {errorAuthStatus ? <span className="m-a" id="status">Неправильный пароль!</span> : <></>}
            <span className="m-a">Вход в комнату</span>
            <span className="m-a" id="room-name" title={roomName}>{roomName}</span>
            <Input
                id="pass"
                password={true}
                placeholder="Введите пароль"
                value={password}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
            />
            <input id="btn-join" type="submit" value="Войти" onClick={handleJoinClick} />
        </div>
    );

    useEffect(() =>
    {
        document.title = `Nostromo - Авторизация в комнате - ${roomName}`;
    }, [roomName]);

    return (
        <>
            <Header title={`Авторизация в комнате - ${roomName}`} />
            <div id="main">
                {formComponent}
            </div>
        </>
    );
};
