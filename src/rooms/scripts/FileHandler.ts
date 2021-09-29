import { FileHandlerConstants, FileHandlerRequest, HttpMethod, IncomingHttpHeaders } from "nostromo-shared/types/FileHandlerTypes";

class TusHeadRequest implements FileHandlerRequest
{
    public method: HttpMethod = "head";
    public path: string = FileHandlerConstants.FILES_ROUTE;
    public headers: IncomingHttpHeaders = {
        "Tus-Resumable": FileHandlerConstants.TUS_VERSION
    };
    constructor(fileId: string)
    {
        this.path += `/${fileId}`;
    }
}

// класс - обработчик файлов
export class FileHandler
{
    private readonly MEGA = 1024 * 1024;
    public async fileUpload(file: File, progress: HTMLProgressElement): Promise<string>
    {
        return new Promise((resolve, reject) =>
        {
            console.log("[FileHandler] > Отправляем файл:", file.name, (file.size / this.MEGA).toFixed(3));

            const req = new TusHeadRequest("testId");

            const xhr = new XMLHttpRequest();
            xhr.open(req.method, req.path, true);

            for (const header in req.headers)
            {
                const value = req.headers[header]!;
                xhr.setRequestHeader(header, value);
            }

            xhr.addEventListener("load", () =>
            {
                console.log(xhr.status);
                resolve(xhr.responseText);
            });
            xhr.send();


            /*xhr.open("POST", "/files", true);

            // отображаем прогресс
            progress.max = 100;
            xhr.upload.addEventListener("progress", (event) =>
            {
                if (event.lengthComputable)
                {
                    progress.value = (event.loaded / event.total) * 100;
                }
            });

            xhr.addEventListener("load", () =>
            {
                console.log(`[FileHandler] > Отправка файла завершена! fileId: ${xhr.responseText}`);
                progress.hidden = true;

                if (xhr.status == 201)
                    resolve(xhr.responseText);
            });

            xhr.send(file);
            progress.hidden = false;*/
        });
    }
}