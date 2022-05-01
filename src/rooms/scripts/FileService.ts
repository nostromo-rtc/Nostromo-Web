import { FileServiceConstants } from "nostromo-shared/types/FileServiceTypes";
import { PrefixConstants } from "nostromo-shared/types/RoomTypes";
import { handleCriticalError } from "./AppError";
import { TusHeadRequest, TusOptionsRequest, TusPatchRequest, TusPostCreationRequest } from "./FileServiceTusProtocol";

type FileHasBeenUploadedCallback = (fileId: string, file: File, progressComponent: HTMLDivElement) => void;

/** Класс - обработчик файлов. */
export class FileService
{
    /** Максимальный размер файла. */
    private maxSize = 0;

    /** Узнаём настройки протокола TUS на сервере. */
    private fileServiceOptions(): void
    {
        console.log("[FileService] > Узнаем настройки протокола TUS на сервере...");

        const optionsReq = new TusOptionsRequest();

        const xhr = new XMLHttpRequest();
        xhr.open(optionsReq.method, optionsReq.path, true);

        xhr.addEventListener("load", () =>
        {
            if (xhr.status == optionsReq.successfulStatusCode)
            {
                if (xhr.getResponseHeader("Tus-Version") != FileServiceConstants.TUS_VERSION
                    || xhr.getResponseHeader("Tus-Resumable") != FileServiceConstants.TUS_VERSION)
                {
                    handleCriticalError(new Error("Wrong TUS version!"));
                }

                if (!xhr.getResponseHeader("Tus-Extension")?.includes("creation"))
                {
                    handleCriticalError(new Error("Server doesn't support TUS 'creation' extension!"));
                }

                this.maxSize = Number(xhr.getResponseHeader("Tus-Max-Size"));

                console.debug(`[FileService] Max size for file: ${this.maxSize}`);
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
        this.fileServiceOptions();
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
        progressComponent: HTMLDivElement,
        cb: FileHasBeenUploadedCallback
    ): Promise<void>
    {
        /// TODO: на телефоне lastModified выдает текущую дату.
        /// Нужно придумать другой способ - через хэш или уточнять у юзера.
        const fileMetadata = `${roomId},${file.name},${file.size},${file.lastModified}`;

        // Ищем fileId в локальном хранилище.
        const fileId = localStorage.getItem(fileMetadata) ?? await this.createFileOnServer(roomId, file);
        localStorage.setItem(fileMetadata, fileId);

        // Присваиваем id для компонента с прогрессом.
        progressComponent.id = `progress-file-${fileId}`;

        /// TODO: пока так, через children, когда будет React - переделаю.
        /** Статус загрузки файла. */
        const progressTitle = progressComponent.children[0] as HTMLProgressElement;
        /** Прогресс-бар. */
        const progressBar = progressComponent.children[1] as HTMLProgressElement;
        /** Кнопка для остановки загрузки файла. */
        const abortBtn = progressComponent.children[2] as HTMLButtonElement;

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
                return await this.fileUpload(roomId, file, progressComponent, cb);
            }
        }

        return new Promise((resolve, reject) =>
        {
            console.log(`[FileService] > Отправляем файл: ${file.name}, ${(file.size / PrefixConstants.MEGA).toFixed(3)} Mb (${file.size} bytes).`);
            console.log(`[FileService] Upload-Offset: ${uploadOffset}`);

            // Если мы уже загрузили этот файл на сервер,
            // то просто возвращаем Id файла.
            if (Number(uploadOffset) == file.size)
            {
                // Вызываем коллбек для отправки ссылки на файл в чат.
                cb(fileId, file, progressComponent);

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
                console.log(`[FileService] > Отправка файла завершена!`);

                if (xhr.status == req.successfulStatusCode)
                {
                    // Вызываем коллбек для отправки ссылки на файл в чат.
                    cb(fileId, file, progressComponent);

                    resolve();
                }
                else
                {
                    /// TODO: как-то обрабатывать ошибочные статусы
                    reject(xhr.status);
                }
            });

            // Отображаем прогресс.
            xhr.upload.addEventListener("progress", (event) =>
            {
                const bytesToMegabytes = (bytes: number) : string =>
                {
                    return `${(bytes / (1024 * 1024)).toFixed(3)}`;
                };

                if (event.lengthComputable)
                {
                    const bytesLoaded = Number(uploadOffset) + event.loaded;

                    progressTitle.textContent = `${file.name} (${bytesToMegabytes(bytesLoaded)} / ${bytesToMegabytes(file.size)} MB)`;
                    progressBar.value = (bytesLoaded / file.size) * 100;
                }
            });

            xhr.addEventListener("error", async (event) =>
            {
                console.log(`[FileService] > Ошибка во время отправления файла!`, event);
                // Попробуем загрузить файл заново.
                return await this.fileUpload(roomId, file, progressComponent, cb);
            });

            xhr.addEventListener("timeout", async (event) =>
            {
                console.log(`[FileService] > Timeout во время отправления файла!`, event);
                // Попробуем загрузить файл заново.
                return await this.fileUpload(roomId, file, progressComponent, cb);
            });

            // Обрабатываем нажатие на кнопку остановки загрузки.
            abortBtn.onclick = () => {
                console.debug("Остановка загрузки файла...", file);
                xhr.abort();
                progressComponent.remove();
                return resolve();
            };

            // Отправляем файл, учитывая Upload-Offset.
            xhr.send(file.slice(Number(uploadOffset)));
        });
    }
}