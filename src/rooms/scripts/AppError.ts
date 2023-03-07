// браузер не поддерживается
import { UnsupportedError } from "mediasoup-client/lib/errors";

export { UnsupportedError };

// ICE состояние транспортного канала стало failed
export class TransportFailedError extends Error
{
    constructor(message: string)
    {
        super(message);
        this.name = this.constructor.name;
    }
}

type ErrorMsg = { consoleMsg: string, alertMsg: string; }

function getErrorMsg(error: Error): ErrorMsg
{
    switch (error.name)
    {
        case UnsupportedError.name: {
            const consoleMsg = "[Global] Browser is not supported.";
            const alertMsg = "Браузер или версия браузера не поддерживается!";
            return { consoleMsg, alertMsg };
        }
        case TransportFailedError.name: {
            const consoleMsg = "[Mediasoup] Transport failed. Check your proxy settings.";
            const alertMsg = `Не удалось соединиться с медиасервером! Проверьте свои настройки прокси.`;
            return { consoleMsg, alertMsg };
        }
        default: {
            const consoleMsg = "[Global] Unexpected error.";
            const alertMsg = `Непредвиденная ошибка!`;
            return { consoleMsg, alertMsg };
        }
    }
}

export function handleCriticalError(error: Error) : void
{
    const { consoleMsg, alertMsg } = getErrorMsg(error);
    console.error(`${consoleMsg}\n${error.name}: ${error.message}`);
    alert(`${alertMsg}\n${error.name}: ${error.message}`);
    document.location.replace("/");
}