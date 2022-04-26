import Plyr from 'plyr';
import { Howl } from 'howler';
import svgSprite from "plyr/dist/plyr.svg";
import { ChatFileInfo } from "nostromo-shared/types/RoomTypes";

// Plyr добавляет поле с плеером в класс HTMLVideoElement.
declare global
{
    interface HTMLVideoElement
    {
        plyr: Plyr;
    }
}

export const enum UiSound
{
    /** Звук-оповещение о входе нового пользователя. */
    joined,
    /** Звук-оповещение об уходе пользователя. */
    left,
    /** Звук-оповещение о выключенном микрофоне (то есть постановка на паузу). */
    micOff,
    /** Звук-оповещение о включенном микрофоне (если он был на паузе.) */
    micOn,
    /** Звук-оповещение о сообщении. */
    msg,
    /** Звук-оповещение о выключении звука. */
    soundOff,
    /** Звук-оповещение о включении звука. */
    soundOn,
    /** Звук-оповещение о прекращении работы видеопотока. */
    videoOff,
    /** Звук-оповещение о появлении видеопотока. */
    videoOn
}

/** Класс для работы с интерфейсом (веб-страница). */
export class UI
{
    /** Кнопки. */
    public readonly buttons: Map<string, HTMLButtonElement> = this.prepareButtons();

    /** Название комнаты. */
    private _roomName = document.getElementById('room-name') as HTMLSpanElement;
    public get roomName(): string
    {
        return this._roomName.innerText;
    }
    public set roomName(name: string)
    {
        this._roomName.innerText = name;
    }

    /** Контейнер с видеоэлементами. */
    private _allVideos = new Map<string, HTMLVideoElement>();
    public get allVideos(): Map<string, HTMLVideoElement>
    {
        return this._allVideos;
    }

    /** Чат. */
    public readonly chat = document.getElementById('chat') as HTMLDivElement;

    /** Поле для выбора файла. */
    public readonly fileInput = document.getElementById('file-input') as HTMLInputElement;

    /** Контейнер с прогрессами отправки файлов. */
    public readonly filesProgress = document.getElementById('files-progress') as HTMLDivElement;

    /** Сообщение пользователя, отправляемое в чат. */
    public readonly messageText = document.getElementById('message-textarea') as HTMLTextAreaElement;

    /** Список разрешений захвата видеоизображения. */
    public readonly captureSettingsDisplay = document.getElementById('capture-settings-display') as HTMLSelectElement;

    /** Список разрешений захвата веб-камеры. */
    public readonly captureSettingsCam = document.getElementById('capture-settings-cam') as HTMLSelectElement;

    /** Список устройств-микрофонов. */
    public readonly micDevices = document.getElementById("mic-devices") as HTMLSelectElement;

    /** Список устройств-вебкамер. */
    public readonly camDevices = document.getElementById("cam-devices") as HTMLSelectElement;

    /** Получить выбранное пользователем разрешение для захвата видеоизображения. */
    public get currentCaptureSettingDisplay(): string
    {
        return this.captureSettingsDisplay.value;
    }

    /** Получить выбранное пользователем разрешение для захвата веб-камеры. */
    public get currentCaptureSettingCam(): string
    {
        return this.captureSettingsCam.value;
    }

    /** Получить выбранное пользователем устройство-микрофон. */
    public get currentMicDevice(): string
    {
        return this.micDevices.value;
    }

    /** Получить выбранное пользователем устройство-вебкамеру. */
    public get currentCamDevice(): string
    {
        return this.camDevices.value;
    }

    /** Поле для ввода имени пользователя. */
    public readonly usernameInput = document.getElementById('username-input') as HTMLInputElement;

    /** Чекбокс для включения/выключения звуковых оповещений. */
    public readonly checkboxNotifications = document.getElementById("checkbox-notifications") as HTMLInputElement;

    /** Количество строк в раскладке. */
    private videoRows = 2;

    /** Количество столбцов в раскладке. */
    private videoColumns = 2;

    /** Текущая политика Mute для видео (свойство muted). */
    private mutePolicy = true;

    /** Звуки интерфейса. */
    private uiSounds = new Map<UiSound, Howl>();

    /** Кулдаун (пауза между действиями) для воспроизведения звуков. */
    private uiSoundCooldown = false;

    /** Связка userId - username. */
    public usernames = new Map<string, string>();

    constructor()
    {
        console.debug('[UI] > ctor');
        this.initUiSounds();
        this.prepareMessageText();
        this.handleButtons();

        this.addVideo("local", "main", "local");
        this.resizeVideos();
        window.addEventListener('resize', () => this.resizeVideos());

        this.displayUserName();

        const spritePlyr = document.createElement("div");
        spritePlyr.id = "sprite-plyr";
        spritePlyr.innerHTML = svgSprite;
        document.body.append(spritePlyr);

        this.setupCheckboxNotificationsFromLocalStorage();
        this.checkboxNotifications.addEventListener("click", () =>
        {
            this.changeCheckboxNotificationsState();
        });

        // Ограничение по длине имени пользователя.
        this.usernameInput.maxLength = 32;
    }

    private initUiSounds(): void
    {
        this.uiSounds.set(UiSound.joined, new Howl({ src: "/rooms/sounds/joined.mp3" }));
        this.uiSounds.set(UiSound.left, new Howl({ src: "/rooms/sounds/left.mp3" }));
        this.uiSounds.set(UiSound.micOn, new Howl({ src: "/rooms/sounds/mic-on.mp3" }));
        this.uiSounds.set(UiSound.micOff, new Howl({ src: "/rooms/sounds/mic-off.mp3" }));
        this.uiSounds.set(UiSound.msg, new Howl({ src: "/rooms/sounds/msg.mp3" }));
        this.uiSounds.set(UiSound.soundOff, new Howl({ src: "/rooms/sounds/sound-off.mp3" }));
        this.uiSounds.set(UiSound.soundOn, new Howl({ src: "/rooms/sounds/sound-on.mp3" }));
        this.uiSounds.set(UiSound.videoOff, new Howl({ src: "/rooms/sounds/video-off.mp3" }));
        this.uiSounds.set(UiSound.videoOn, new Howl({ src: "/rooms/sounds/video-on.mp3" }));
    }

    /** Подключить обработчики к кнопкам. */
    private handleButtons(): void
    {
        // Кнопка включения звука собеседников.
        const btn_enableSounds = this.buttons.get('enable-sounds')!;
        btn_enableSounds.addEventListener('click', () =>
        {
            this.enableSounds();
            this.toggleSoundsButtons();
        });

        // Кнопка выключения звука собеседников.
        const btn_disableSounds = this.buttons.get('disable-sounds')!;
        btn_disableSounds.addEventListener('click', () =>
        {
            this.disableSounds();
            this.toggleSoundsButtons();
        });
    }

    /** Переключить видимость кнопок включения/выключения звуков собеседника. */
    private toggleSoundsButtons(): void
    {
        const btn_enableSounds = this.buttons.get('enable-sounds')!;
        const btn_disableSounds = this.buttons.get('disable-sounds')!;
        const attention = document.getElementById('attention')!;

        btn_enableSounds.hidden = !btn_enableSounds.hidden;
        btn_disableSounds.hidden = !btn_disableSounds.hidden;
        attention.hidden = !attention.hidden;
    }

    /** Переключить видимость кнопок включения/выключения (пауза) микрофона. */
    public toggleMicPauseButtons(): void
    {
        const btn_pauseMic = this.buttons.get('pause-mic')!;
        const btn_unpauseMic = this.buttons.get('unpause-mic')!;

        btn_pauseMic.hidden = !btn_pauseMic.hidden;
        btn_unpauseMic.hidden = !btn_unpauseMic.hidden;
    }

    /** Переключить видимость кнопок захвата/прекращения захвата микрофона. */
    public toggleMicButtons(): void
    {
        const btn_getMic = this.buttons.get('get-mic')!;
        const btn_stopMic = this.buttons.get('stop-mic')!;

        btn_getMic.hidden = !btn_getMic.hidden;
        btn_stopMic.hidden = !btn_stopMic.hidden;
    }

    /** Переключить видимость кнопок захвата/прекращения захвата вебки. */
    public toggleCamButtons(): void
    {
        const div_getCam = document.getElementById('div-get-cam')!;
        const btn_stopCam = this.buttons.get('stop-cam')!;

        div_getCam.hidden = !div_getCam.hidden;
        btn_stopCam.hidden = !btn_stopCam.hidden;
    }

    /** Переключить видимость кнопок захвата/прекращения захвата экрана компьютера. */
    public toggleDisplayButtons(): void
    {
        const div_getDisplay = document.getElementById('div-get-display')!;
        const btn_stopDisplay = this.buttons.get('stop-display')!;

        div_getDisplay.hidden = !div_getDisplay.hidden;
        btn_stopDisplay.hidden = !btn_stopDisplay.hidden;
    }

    /** Скрыть видимость кнопок включения/выключения (пауза) микрофона. */
    public hideMicPauseButtons(): void
    {
        const btn_pauseMic = this.buttons.get('pause-mic')!;
        const btn_unpauseMic = this.buttons.get('unpause-mic')!;

        btn_pauseMic.hidden = true;
        btn_unpauseMic.hidden = true;
    }

    /** Добавить новый выбор в виджет Select. */
    public addOptionToSelect(select: HTMLSelectElement, label: string, value: string): void
    {
        const newOption = new Option(label, value);
        select.add(newOption);
    }

    /** Подготовить контейнер map с кнопками. */
    private prepareButtons(): Map<string, HTMLButtonElement>
    {
        const buttons = new Map<string, HTMLButtonElement>();

        buttons.set('get-mic', document.getElementById('btn-get-mic') as HTMLButtonElement);
        buttons.set('stop-mic', document.getElementById('btn-stop-mic') as HTMLButtonElement);
        buttons.set('pause-mic', document.getElementById('btn-pause-mic') as HTMLButtonElement);
        buttons.set('unpause-mic', document.getElementById('btn-unpause-mic') as HTMLButtonElement);
        buttons.set('get-cam', document.getElementById('btn-get-cam') as HTMLButtonElement);
        buttons.set('stop-cam', document.getElementById('btn-stop-cam') as HTMLButtonElement);
        buttons.set('get-display', document.getElementById('btn-get-display') as HTMLButtonElement);
        buttons.set('stop-display', document.getElementById('btn-stop-display') as HTMLButtonElement);
        buttons.set('send-message', document.getElementById('btn-send-message') as HTMLButtonElement);
        buttons.set('send-file', document.getElementById('btn-send-file') as HTMLButtonElement);
        buttons.set('enable-sounds', document.getElementById('btn-enable-sounds') as HTMLButtonElement);
        buttons.set('disable-sounds', document.getElementById('btn-disable-sounds') as HTMLButtonElement);
        buttons.set('set-new-username', document.getElementById('btn-set-new-username') as HTMLButtonElement);

        return buttons;
    }

    /** Обработка событий для виджета, куда вводится сообщение пользователя, отправляемое в чат. */
    private prepareMessageText(): void
    {
        this.messageText.addEventListener('keydown', (e) =>
        {
            if (e.key == 'Enter' && !e.shiftKey)
            {
                e.preventDefault();
                this.buttons.get('send-message')!.click();
                this.messageText.value = '';
            }
        });
    }

    /** Установить новое имя для пользователя. */
    public setNewUsernameFromInput(): string
    {
        let username = this.usernameInput.value;

        if (username.length > 32)
        {
            username = username.slice(0, 32);
        }

        this.usernames.set("local", username);

        this.displayUserName();

        return username;
    }

    /** Показать имя пользователя. */
    public displayUserName(): void
    {
        const username = this.usernames.get("local") ?? "Гость";
        this.usernameInput.value = username;
        this.updateVideoLabels("local", username);
    }

    /** Включить звук для всех видео. */
    private enableSounds(): void
    {
        this.disableSounds(false);
    }

    /** Выключить звук для всех видео. */
    private disableSounds(disable = true): void
    {
        for (const video of this._allVideos)
        {
            if (video[0] != "local-main")
            {
                video[1].muted = disable;
            }
        }
        this.mutePolicy = disable;

        if (disable)
        {
            this.playSound(UiSound.soundOff);
        }
        else
        {
            this.playSound(UiSound.soundOn);
        }
    }

    /** Создать видеоэлемент. */
    private createVideoItem(userId: string, videoId: string, name: string): HTMLDivElement
    {
        const id = `${userId}-${videoId}`;

        const newVideoItem = document.createElement('div');
        newVideoItem.id = `video-item-${id}`;
        newVideoItem.setAttribute("data-userid", userId);
        newVideoItem.classList.add('video-item');

        const videoLabel = this.prepareVideoLabel();
        this.setTextIntoVideoLabel(videoLabel, name, userId);
        videoLabel.id = `video-label-${id}`;
        videoLabel.hidden = true;
        newVideoItem.appendChild(videoLabel);

        const centerVideoLabel = this.prepareCenterVideoLabel();
        this.setTextIntoVideoLabel(centerVideoLabel, name, userId);
        centerVideoLabel.id = `center-video-label-${id}`;
        newVideoItem.appendChild(centerVideoLabel);

        const newVideo = document.createElement('video');
        newVideo.id = `video-${id}`;
        newVideo.autoplay = true;
        newVideo.muted = this.mutePolicy;
        newVideo.poster = './images/novideodata.jpg';

        newVideoItem.appendChild(newVideo);

        this._allVideos.set(id, newVideo);

        this.prepareVideoPlayer(newVideo, userId == "local");

        return newVideoItem;
    }

    /** Добавить новый видеоэлемент пользователя userId. */
    public addVideo(userId: string, videoId: string, name: string): void
    {
        const videoItem = this.createVideoItem(userId, videoId, name);
        document.getElementById('videos')!.appendChild(videoItem);

        // перестроим раскладку
        this.calculateLayout();
        this.resizeVideos();
    }

    /** Добавить новый неосновной-видеоэлемент пользователя userId. */
    public addSecondaryVideo(userId: string, videoId: string, name: string): void
    {
        const newVideoItem = this.createVideoItem(userId, videoId, name);
        const videoItemsOfUser = document.querySelectorAll(`.video-item[data-userid='${userId}']`);
        videoItemsOfUser.item(videoItemsOfUser.length - 1).after(newVideoItem);

        // перестроим раскладку
        this.calculateLayout();
        this.resizeVideos();
    }

    /** Обновления текстовой метки видеоэлемента. */
    public updateVideoLabels(userId: string, newName: string): void
    {
        const videoLabels = this.getVideoLabels(userId);
        for (const label of videoLabels)
        {
            this.setTextIntoVideoLabel(label, newName, userId);
        }

        const centerVideoLabels = this.getCenterVideoLabels(userId);
        for (const centerLabel of centerVideoLabels)
        {
            this.setTextIntoVideoLabel(centerLabel, newName, userId);
        }
    }

    /** Удалить видео собеседника (и обновить раскладку). */
    public removeVideo(userId: string, videoId: string): void
    {
        const id = `${userId}-${videoId}`;

        const videoItem = document.getElementById(`video-item-${id}`);
        if (videoItem)
        {
            // Отвязываем стрим от UI видеоэлемента.
            const videoElement = this._allVideos.get(id)!;
            videoElement.srcObject = null;
            // Удаляем videoItem.
            videoItem.remove();
            // Удаляем видеоэлемент из контейнера всех видеоэлементов.
            this._allVideos.delete(id);
            // Обновляем раскладку.
            this.calculateLayout();
            this.resizeVideos();
        }
    }

    /** Удалить все видео от собеседника (и обновить раскладку). */
    public removeVideos(userId: string): void
    {
        const videoItems = document.querySelectorAll(`.video-item[data-userid='${userId}']`);
        for (const item of videoItems)
        {
            const idx = "video-item-".length;
            const id = item.id.slice(idx);

            // отвязываем стрим от UI видеоэлемента
            const videoElement = this._allVideos.get(id)!;
            videoElement.srcObject = null;
            // Удаляем videoItem с этим id
            item.remove();
            // Удаляем видеоэлемент из контейнера всех видеоэлементов
            this._allVideos.delete(id);
            // обновляем раскладку
            this.calculateLayout();
            this.resizeVideos();
        }
    }

    /**
     *  Подсчитать количество столбцов и строк в раскладке
     *  в зависимости от количества собеседников.
     */
    private calculateLayout(): void
    {
        const videoCount = this._allVideos.size;
        // если только 1 видео на экране
        if (videoCount == 1)
        {
            this.videoRows = 2;
            this.videoColumns = 2;
        } // если количество собеседников превысило размеры сетки раскладки
        else if (videoCount > this.videoColumns * this.videoRows)
        {
            // если количество столбцов не равно количеству строк, значит увеличиваем количество строк
            if (this.videoColumns != this.videoRows)
            {
                ++this.videoRows;
            }
            // иначе увеличиваем количество столбцов
            else
            {
                ++this.videoColumns;
            }
        } // пересчитываем сетку и после выхода пользователей
        else if (videoCount < this.videoColumns * this.videoRows)
        {
            if (this.videoColumns == this.videoRows &&
                (videoCount <= this.videoColumns * (this.videoRows - 1)))
            {
                --this.videoRows;
            }
            else if (this.videoColumns != this.videoRows &&
                (videoCount <= (this.videoColumns - 1) * this.videoRows))
            {
                --this.videoColumns;
            }
        }
    }

    /** Перестроить раскладку. */
    private resizeVideos(): void
    {
        const header_offset = 82.5;
        const nav_offset = 150;
        const offset = 30;
        const aspect_ratio = 16 / 9;
        // max_h для регулирования размеров видео, чтобы оно вмещалось в videoRows (количество) строк
        const max_h = ((document.documentElement.clientHeight - header_offset) / this.videoRows) - offset;
        const flexBasis = ((document.documentElement.clientWidth - nav_offset) / this.videoColumns) - offset;
        for (const videoItem of document.getElementsByClassName('video-item'))
        {
            (videoItem as HTMLDivElement).style.maxWidth = String(max_h * aspect_ratio) + 'px';
            (videoItem as HTMLDivElement).style.flexBasis = String(flexBasis) + 'px';
        }
    }

    /** Подготовить плеер для видеоэлемента. */
    private prepareVideoPlayer(video: HTMLVideoElement, isLocal: boolean)
    {
        const player = new Plyr(video, {
            ratio: '16:9',
            disableContextMenu: false,
            storage: { enabled: false },
            keyboard: { focused: false, global: false },
            clickToPlay: false,
            muted: isLocal ? true : this.mutePolicy,
            controls: ['play-large', 'play', 'mute', 'volume', 'fullscreen'],
            loadSprite: false
        });

        // добавляем стиль (чтобы было как fluid у videojs)
        player.elements.container!.classList.add('video-container');
        // убираем ненужный div с постером
        player.elements.wrapper!.children[1].remove();
        // скрываем элементы управления
        this.hideControls(player);
    }

    /** Скрыть элементы управления у плеера. */
    public hideControls(player: Plyr, hide = true): void
    {
        player.elements.controls!.hidden = hide;

        const btns_play = player.elements.buttons.play! as HTMLButtonElement[];
        btns_play[0].hidden = hide;
    }

    /** Скрыть регулировку звука у плеера. */
    public hideVolumeControl(player: Plyr, hide = true): void
    {
        const volumeDiv: HTMLDivElement = player.elements.controls!.querySelector('.plyr__volume')!;
        volumeDiv.hidden = hide;
    }

    /** Показать элементы управления у плеера. */
    public showControls(player: Plyr, hasAudio: boolean): void
    {
        // не скрывать элементы управления
        this.hideControls(player, false);

        // если есть аудио, то не скрывать регулировку звука
        // если аудио нет, то скрыть регулировку
        this.hideVolumeControl(player, !hasAudio);
    }

    /** Подготовить новую текстовую метку для локального видеоэлемента. */
    private prepareVideoLabel(): HTMLSpanElement
    {
        const label = document.createElement('span');
        label.classList.add('video-label');
        return label;
    }

    /** Подготовить текстовую метку для локального видеоэлемента. */
    private setTextIntoVideoLabel(label: HTMLSpanElement, name: string, userId: string): void
    {
        label.innerText = name;
        if (userId == "local")
        {
            label.title = `${name}`;
        }
        else
        {
            label.title = `${name} #${userId.slice(0, 4)}`;
        }
    }

    public createProgressComponent(file: File): HTMLDivElement
    {
        /** Компонент прогресса для файла. */
        const progressComponent = document.createElement('div');

        /** Заголовок компонента прогресса (название и размер). */
        const progressTitle = document.createElement('p');
        progressTitle.textContent = `${file.name} (${(file.size / (1024 * 1024)).toFixed(3)} MB)`;
        progressComponent.append(progressTitle);

        /** Прогресс-бар. */
        const progress = document.createElement('progress');
        progress.max = 100;
        progressComponent.append(progress);

        /** Кнопка для остановки загрузки. */
        const abortBtn = document.createElement('button');
        abortBtn.textContent = "Отмена";

        progressComponent.append(abortBtn);

        // Добавим компонент к общему контейнеру с прогрессами.
        this.filesProgress.append(progressComponent);

        return progressComponent;
    }

    public prepareCenterVideoLabel(): HTMLSpanElement
    {
        const centerVideoLabel = document.createElement('span');
        centerVideoLabel.classList.add('center-video-label');
        return centerVideoLabel;
    }

    public getCenterVideoLabels(userId: string): NodeListOf<HTMLSpanElement>
    {
        return document.querySelectorAll(`.video-item[data-userid='${userId}'] > .center-video-label`);
    }

    public getCenterVideoLabel(userId: string, videoId: string): HTMLSpanElement | null
    {
        return document.getElementById(`center-video-label-${userId}-${videoId}`);
    }

    public getVideoLabels(userId: string): NodeListOf<HTMLSpanElement>
    {
        return document.querySelectorAll(`.video-item[data-userid='${userId}'] > .video-label`);
    }

    public getVideoLabel(userId: string, videoId: string): HTMLSpanElement | null
    {
        return document.getElementById(`video-label-${userId}-${videoId}`);
    }

    /**
     * Переключить видимость для меток на видео.
     * Если было видно центральную метку, то скрыть её и показать метку в правом верхнем углу.
     * И наоборот.
     */
    public toggleVideoLabels(first: HTMLSpanElement, second: HTMLSpanElement): void
    {
        const tempValue = first.hidden;
        first.hidden = second.hidden;
        second.hidden = tempValue;
    }

    /** Прочитать из локального хранилище настройку воспроизведения звуковых оповещений. */
    private setupCheckboxNotificationsFromLocalStorage(): void
    {
        if (localStorage["enable-notifications"] == undefined)
        {
            localStorage["enable-notifications"] = "true";
        }
        this.checkboxNotifications.checked = (localStorage["enable-notifications"] == "true");
    }

    /** Установить новое состояние для чекбокса notifications. */
    private changeCheckboxNotificationsState(): void
    {
        localStorage["enable-notifications"] = this.checkboxNotifications.checked;
    }

    public playSound(sound: UiSound)
    {
        if (this.checkboxNotifications.checked)
        {
            this.uiSounds.get(sound)?.play();
        }
    }

    public playSoundWithCooldown(sound: UiSound)
    {
        if (!this.uiSoundCooldown)
        {
            this.playSound(sound);

            this.uiSoundCooldown = true;
            setTimeout(() => this.uiSoundCooldown = false, 3000);
        }
    }

    /** Получить время в формате 00:00:00 (24 часа). */
    public getTimestamp(): string
    {
        const timestamp = (new Date).toLocaleString("en-us", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        });
        return timestamp;
    }

    /** Отобразить сообщение в чате. */
    public displayChatMsg(userId: string, message: string)
    {
        const messageDiv = document.createElement("div");
        messageDiv.setAttribute("data-userid", userId);
        messageDiv.classList.add("message");

        if (userId == "local")
        {
            messageDiv.classList.add("background-lightgreen");
        }
        else
        {
            messageDiv.classList.add("background-white");
        }

        const messageSenderDiv = document.createElement("div");
        messageSenderDiv.classList.add("d-flex");

        const messageSenderName = document.createElement("span");
        messageSenderName.className = "message-sender-name color-dodgerblue bold";
        messageSenderName.innerText = this.usernames.get(userId)!;
        messageSenderName.title = this.usernames.get(userId)!;
        messageSenderDiv.appendChild(messageSenderName);

        if (userId != "local")
        {
            const messageSenderId = document.createElement("span");
            messageSenderId.className = "message-sender-id";
            messageSenderId.innerText = `#${userId.substring(0, 4)}`;
            messageSenderId.title = `#${userId}`;
            messageSenderDiv.appendChild(messageSenderId);
        }

        const messageTextDiv = document.createElement("div");
        messageTextDiv.classList.add("message-text");
        messageTextDiv.innerText = message;

        const messageDateDiv = document.createElement("div");
        messageDateDiv.classList.add("message-date");
        messageDateDiv.innerText = this.getTimestamp();

        messageDiv.appendChild(messageSenderDiv);
        messageDiv.appendChild(messageTextDiv);
        messageDiv.appendChild(messageDateDiv);

        this.chat.append(messageDiv);
        this.chat.scrollTop = this.chat.scrollHeight;
    }

    public displayChatLink(info: ChatFileInfo)
    {
        const { userId, fileId, filename, size } = info;

        const messageDiv = document.createElement('div');
        messageDiv.setAttribute("data-userid", userId);
        messageDiv.classList.add("message");

        if (userId == "local")
        {
            messageDiv.classList.add("background-lightgreen");
        }
        else
        {
            messageDiv.classList.add("background-white");
        }

        const messageSenderDiv = document.createElement("div");
        messageSenderDiv.classList.add("d-flex");

        const messageSenderName = document.createElement("span");
        messageSenderName.className = "message-sender-name color-dodgerblue bold";
        messageSenderName.innerText = this.usernames.get(userId)!;
        messageSenderName.title = this.usernames.get(userId)!;
        messageSenderDiv.appendChild(messageSenderName);

        if (userId != "local")
        {
            const messageSenderId = document.createElement("span");
            messageSenderId.className = "message-sender-id";
            messageSenderId.innerText = `#${userId.substring(0, 4)}`;
            messageSenderId.title = `#${userId}`;
            messageSenderDiv.appendChild(messageSenderId);
        }

        const messageTextDiv = document.createElement('div');
        messageTextDiv.classList.add("message-text");

        const messageFileLabelSpan = document.createElement('span');
        messageFileLabelSpan.classList.add("color-customgray");
        messageFileLabelSpan.innerText = "Файл: ";

        const messageFileNameSpan = document.createElement('span');
        messageFileNameSpan.className = "color-darkviolet bold";
        messageFileNameSpan.innerText = filename;

        const messageFileSizeDiv = document.createElement('div');
        messageFileSizeDiv.className = "message-file-size bold";
        messageFileSizeDiv.innerText = `${(size / (1024 * 1024)).toFixed(3)} MB`;

        messageTextDiv.appendChild(messageFileLabelSpan);
        messageTextDiv.appendChild(messageFileNameSpan);
        messageTextDiv.appendChild(messageFileSizeDiv);

        const messageDateDiv = document.createElement('div');
        messageDateDiv.classList.add("message-date");
        messageDateDiv.innerText = this.getTimestamp();

        const messageLink = document.createElement('a');
        messageLink.classList.add("message-link");
        messageLink.href = `${window.location.origin}/files/${fileId}`;
        messageLink.target = "_blank";

        messageDiv.appendChild(messageSenderDiv);
        messageDiv.appendChild(messageTextDiv);
        messageDiv.appendChild(messageDateDiv);
        messageDiv.appendChild(messageLink);

        this.chat.append(messageDiv);
        this.chat.scrollTop = this.chat.scrollHeight;
    }

    public updateNicknameInChat(userId: string)
    {
        for (const msg of this.chat.childNodes)
        {
            const msgDiv = msg as HTMLDivElement;
            if (msgDiv.getAttribute("data-userid") == userId)
            {
                const messageSenderDiv = msgDiv.getElementsByClassName("message-sender-name")[0] as HTMLDivElement;
                messageSenderDiv.innerText = this.usernames.get(userId)!;
                messageSenderDiv.title = this.usernames.get(userId)!;
            }
        }
    }
}