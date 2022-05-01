import { Buffer } from "buffer/";

// Класс для авторизации в админку
export default class AdminAuthService
{
    private passInput = document.getElementById('pass')! as HTMLInputElement;
    private btn_join = document.getElementById('btn-join')! as HTMLButtonElement;
    private result = document.getElementById('result')! as HTMLParagraphElement;

    constructor()
    {
        console.debug("AdminAuthService ctor");

        this.btn_join.addEventListener('click', async () =>
        {
            const pass: string = (document.getElementById('pass') as HTMLInputElement).value;
            const passBase64 = Buffer.from(pass, "utf-8").toString("base64");

            const res = await fetch("/admin", {
                headers: {
                    "Authorization": passBase64
                }
            });

            if (res.status == 200)
            {
                location.reload();
            }
            else if (res.status == 403 || res.status == 401)
            {
                this.result.innerText = "Неправильный пароль!";
            }
            else
            {
                console.error(`Ошибка во время авторизации: ${res.status}`);
                this.result.innerText = "Ошибка во время авторизации!";
            }
        });

        this.passInput.addEventListener('keydown', (e) =>
        {
            if (e.key == 'Enter' && !e.shiftKey)
            {
                e.preventDefault();
                this.btn_join.click();
            }
        });
    }
}