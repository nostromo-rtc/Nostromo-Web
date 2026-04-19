import "../App.css";
import "./RoomAuthPage.css";

import React, { FormEvent, useEffect, useState } from "react";

import { Header } from "../components/Header";

interface RoomAuthPageParams
{
    roomName: string;
    onSuccess: () => void;
}

export const RoomAuthPage: React.FC<RoomAuthPageParams> = ({ roomName, onSuccess }) =>
{
    const [showError, setShowError] = useState(false);
    const [pass, setPass] = useState("");

    const onSubmit = (ev: FormEvent<HTMLFormElement>): void =>
    {
        ev.preventDefault();

        if (pass === "test")
        {
            onSuccess();
        }
        else
        {
            setShowError(true);
        }
    };

    const formComponent = (
        <form id="auth" autoComplete="on" onSubmit={onSubmit}>
            {showError ? <span className="m-a" id="status">Неправильный пароль!</span> : <></>}
            <span className="m-a">Вход в комнату</span>
            <span className="m-a" id="room-name" title={roomName}>{roomName}</span>
            <input
                id="pass"
                type="password"
                name="password"
                placeholder="Введите пароль"
                value={pass}
                onChange={
                    (ev) => { setPass(ev.target.value); }
                }
            />
            <input id="btn-join" type="submit" value="Войти" />
        </form>
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
