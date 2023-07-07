import React, { FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Header } from "../components/Header";

import "../App.css";
import "./RoomAuthPage.css";

interface Params
{
    setAuth: (isAuth: boolean) => void;
}

export const RoomAuthPage: React.FC<Params> = ({ setAuth }) =>
{
    const { id } = useParams();
    const [status, setStatus] = useState(true);
    const [pass, setPass] = useState("");

    const roomName = "Тестовая";

    const onSubmit = (ev: FormEvent<HTMLFormElement>): void =>
    {
        if (pass === "test")
        {
            setAuth(true);
        }
        else
        {
            setStatus(false);
        }
        ev.preventDefault();
    };

    useEffect(() =>
    {
        document.title = "Nostromo - Авторизация в комнате";
    }, []);

    return (
        <div id="base">
            <Header title="Авторизация в комнате" />
            <div id="main">
                <form id="auth" autoComplete="on" onSubmit={onSubmit}>
                    {!status ? <span className="m-a" id="status">Неправильный пароль!</span> : <></>}
                    <span className="m-a">Вход в комнату</span>
                    <span className="m-a" id="room-name" title={roomName}>{roomName}</span>
                    <input type="text" name="username" defaultValue={id} hidden />
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
                    { /* TODO: это пока заглушка, нужно привязать нормальное действие */}
                    <input id="btn-join" type="submit" value="Войти" />
                </form>
            </div>
        </div>
    );
};