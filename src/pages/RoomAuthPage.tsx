import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Header } from "../components/Header";

import "../App.css";
import "./RoomAuthPage.css";

export const RoomAuthPage: React.FC = () =>
{
    const { id } = useParams();
    const [status, setStatus] = useState(true)

    useEffect(() =>
    {
        document.title = "Nostromo - Авторизация в комнате";
    }, []);

    return (
        <div className="container flex-column">
            <Header title="Авторизация в комнате" />
            <div className="base">
                <form id="auth" autoComplete="on" onSubmit={(ev) => {setStatus(false); ev.preventDefault()}}>
                    {status === false ? <span className="m-a" id="status">Неправильный пароль!</span> : <></>}
                    <span className="m-a">Вход в комнату</span>
                    <span className="m-a" id="room-name">Тестовая</span>
                    <input type="text" name="username" defaultValue={id} hidden />
                    <input id="pass" type="password" name="password" placeholder="Введите пароль" />
                    { /* TODO: это пока заглушка, нужно привязать нормальное действие */ }
                    <input id="btn-join" type="submit" value="Войти" />
                </form>
            </div>
        </div>
    );
};