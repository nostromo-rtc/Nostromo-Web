import { FileHandlerConstants } from "nostromo-shared/types/FileHandlerTypes";
import { handleCriticalError } from "./AppError";
import { TusHeadRequest, TusOptionsRequest, TusPatchRequest, TusPostCreationRequest } from "./FileHandlerTusProtocol";

type FileHasBeenUploadedCallback = (fileId: string, file: File) => void;

/** Класс - обработчик файлов. */
export class FileHandler
{
    private readonly MEGA = 1024 * 1024;

    /** Максимальный размер файла. */
    private maxSize = 0;

    /** Узнаём настройки протокола TUS на сервере. */
    private fileHandlerOptions(): void
    {
        console.log("[FileHandler] > Узнаем настройки протокола TUS на сервере...");

        const optionsReq = new TusOptionsRequest();

        const xhr = new XMLHttpRequest();
        xhr.open(optionsReq.method, optionsReq.path, true);

        xhr.addEventListener("load", () =>
        {
            if (xhr.status == optionsReq.successfulStatusCode)
            {
                if (xhr.getResponseHeader("Tus-Version") != FileHandlerConstants.TUS_VERSION
                    || xhr.getResponseHeader("Tus-Resumable") != FileHandlerConstants.TUS_VERSION)
                {
                    handleCriticalError(new Error("Wrong TUS version!"));
                }

                if (!xhr.getResponseHeader("Tus-Extension")?.includes("creation"))
                {
                    handleCriticalError(new Error("Server doesn't support TUS 'creation' extension!"));
                }

                this.maxSize = Number(xhr.getResponseHeader("Tus-Max-Size"));

                console.debug(`[FileHandler] Max size for file: ${this.maxSize}`);
            }
            else
            {
                handleCriticalError(new Error("Wrong TUS 'options' request!"));
            }
        });

        xhr.send();
    }

    constructor()
    {
        this.fileHandlerOptions();
    }

    public async createFileOnServer(roomId: string, file: File): Promise<string>
    {
        return new Promise((resolve, reject) =>
        {
            const req = new TusPostCreationRequest(file.name, file.type, file.size, roomId);

            const xhr = new XMLHttpRequest();
            xhr.open(req.method, req.path, true);

            for (const header in req.headers)
            {
                const value = req.headers[header]!;
                xhr.setRequestHeader(header, value);
            }

            xhr.addEventListener("load", () =>
            {
                if (xhr.status == req.successfulStatusCode)
                {
                    // Получаем Id созданного файла.
                    const fileId = xhr.getResponseHeader("Location");
                    if (!fileId)
                    {
                        return handleCriticalError(new Error("Client has got empty fileId from server."));
                    }
                    resolve(fileId);
                }
                else
                {
                    /// TODO: как-то обрабатывать ошибочные статусы
                    reject(xhr.status);
                }
            });

            xhr.send();
        });
    }

    /** Узнать offset для загрузки файла под номером fileId. */
    public async getUploadOffset(fileId: string): Promise<string>
    {
        return new Promise((resolve, reject) =>
        {
            const req = new TusHeadRequest(fileId);

            const xhr = new XMLHttpRequest();
            xhr.open(req.method, req.path, true);

            for (const header in req.headers)
            {
                const value = req.headers[header]!;
                xhr.setRequestHeader(header, value);
            }

            xhr.addEventListener("load", () =>
            {
                if (xhr.status == req.successfulStatusCode)
                {
                    // Получаем offset для файла.
                    const uploadOffset = xhr.getResponseHeader("Upload-Offset");
                    if (!uploadOffset)
                    {
                        return handleCriticalError(new Error("Client has not got Upload-Offset from server."));
                    }
                    resolve(uploadOffset);
                }
                else
                {
                    /// TODO: как-то обрабатывать ошибочные статусы
                    reject(xhr.status);
                }
            });

            xhr.send();
        });
    }

    /** Загрузить файл на сервер. */
    public async fileUpload(
        roomId: string,
        file: File,
        progress: HTMLProgressElement,
        cb: FileHasBeenUploadedCallback
    ): Promise<void>
    {
        /// TODO: на телефоне lastModified выдает текущую дату.
        /// Нужно придумать другой способ - через хэш или уточнять у юзера.
        const fileMetadata = `${file.name},${file.size},${file.lastModified}`;

        // Ищем fileId в локальном хранилище.
        const fileId = localStorage.getItem(fileMetadata) ?? await this.createFileOnServer(roomId, file);
        localStorage.setItem(`${file.name},${file.size},${file.lastModified}`, fileId);

        console.debug("FileId: ", fileId);

        let uploadOffset = "0";
        try
        {
            uploadOffset = await this.getUploadOffset(fileId);
        }
        catch (error)
        {
            // Если файла с таким Id не найдено
            if ((error as string) == "404")
            {
                // Удалим fileId из локального хранилища.
                localStorage.removeItem(fileMetadata);
                // Попробуем загрузить файл заново.
                return await this.fileUpload(roomId, file, progress, cb);
            }
        }

        return new Promise((resolve, reject) =>
        {
            console.log(`[FileHandler] > Отправляем файл: ${file.name}, ${(file.size / this.MEGA).toFixed(3)} Mb (${file.size} bytes).`);
            console.log(`[FileHandler] Upload-Offset: ${uploadOffset}`);

            // Если мы уже загрузили этот файл на сервер,
            // то просто возвращаем Id файла.
            if (Number(uploadOffset) == file.size)
            {
                // Вызываем коллбек для отправки ссылки на файл в чат.
                cb(fileId, file);

                return resolve();
            }

            const req = new TusPatchRequest(fileId, uploadOffset);

            const xhr = new XMLHttpRequest();
            xhr.open(req.method, req.path, true);

            for (const header in req.headers)
            {
                const value = req.headers[header]!;
                xhr.setRequestHeader(header, value);
            }

            xhr.addEventListener("load", () =>
            {
                console.log(`[FileHandler] > Отправка файла завершена!`);
                progress.hidden = true;

                if (xhr.status == req.successfulStatusCode)
                {
                    // Вызываем коллбек для отправки ссылки на файл в чат.
                    cb(fileId, file);

                    resolve();
                }
                else
                {
                    /// TODO: как-то обрабатывать ошибочные статусы
                    reject(xhr.status);
                }
            });

            // Отображаем прогресс.
            progress.max = 100;
            xhr.upload.addEventListener("progress", (event) =>
            {
                if (event.lengthComputable)
                {
                    const numberUploadOffset = Number(uploadOffset);
                    progress.value = ((numberUploadOffset + event.loaded) / file.size) * 100;
                }
            });

            xhr.addEventListener("error", async (event) =>
            {
                console.log(`[FileHandler] > Ошибка во время отправления файла!`, event);
                // Попробуем загрузить файл заново.
                return await this.fileUpload(roomId, file, progress, cb);
            });

            xhr.addEventListener("timeout", async (event) =>
            {
                console.log(`[FileHandler] > Timeout во время отправления файла!`, event);
                // Попробуем загрузить файл заново.
                return await this.fileUpload(roomId, file, progress, cb);
            });

            // Отправляем файл, учитывая Upload-Offset.
            xhr.send(file.slice(Number(uploadOffset)));

            // Показываем прогресс-бар.
            progress.hidden = false;
        });
    }
}