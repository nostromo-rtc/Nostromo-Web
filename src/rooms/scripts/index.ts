import { UI } from './UI';
import { Mediasoup } from './Mediasoup';
import { UserMedia } from './UserMedia';
import { FileHandler } from "./FileHandler";
import { Room } from './Room';
import { HandleCriticalError } from "./AppError";

import 'plyr/dist/plyr.css';


window.addEventListener("unhandledrejection", (ev: PromiseRejectionEvent) =>
{
    HandleCriticalError(ev.reason);
});

window.addEventListener("error", (ev: ErrorEvent) =>
{
    HandleCriticalError(ev.error);
});

/** Для работы с интерфейсом. */
const ui = new UI();
/** Для работы с медиапотоками на уровне Mediasoup (Consumers и Producers). */
const mediasoup = new Mediasoup();
/** Для работы с файлами. */
const fileHandler = new FileHandler();
/** Комната. */
const room = new Room(ui, mediasoup, fileHandler);
/** Для работы с локальными медиапотоками пользователя. */
const userMedia = new UserMedia(ui, room);