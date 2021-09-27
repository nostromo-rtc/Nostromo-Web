import { UI } from './UI';
import { Mediasoup } from './Mediasoup';
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

const ui = new UI();
const mediasoup = new Mediasoup();
const fileHandler = new FileHandler();
const room = new Room(ui, mediasoup, fileHandler);