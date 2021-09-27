// класс - обработчик файлов
export class FileHandler
{
    private readonly MEGA = 1024 * 1024;
    public async fileUpload(file: File, progress: HTMLProgressElement) : Promise<string>
    {
        return new Promise((resolve, reject) =>
        {
            console.log("[FileHandler] > Отправляем файл:", file.name, (file.size / this.MEGA).toFixed(3));

            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/api/upload", true);

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
            progress.hidden = false;
        });
    }
}