import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Header } from "../components/Header";

import "../App.css";

export const RoomAuthPage: React.FC = () =>
{
    const { id } = useParams();

    useEffect(() =>
    {
        document.title = "Nostromo - Авторизация в комнате";
    }, []);

    return (
        <div id="base">
            <Header title="Авторизация в комнате" />
            <div className="main">
                Авторизация в {id}
            </div>
        </div>
    );
};