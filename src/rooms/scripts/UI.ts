import Plyr from 'plyr';
import { Howl } from 'howler';
import svgSprite from "plyr/dist/plyr.svg";

// Plyr добавляет поле с плеером в класс HTMLVideoElement.
declare global
{
    interface HTMLVideoElement
    {
        plyr: Plyr;
    }
}

/** Класс для работы с интерфейсом (веб-страница). */
export class UI
{
    /** Кнопки. */
    public readonly buttons: Map<string, HTMLButtonElement> = this.prepareButtons();

    /** Название комнаты. */
    private _roomName = document.getElementById('roomName') as HTMLSpanElement;
    public get roomName(): string
    {
        return this._roomName.innerText;
    }
    public set roomName(name: string)
    {
        this._roomName.innerText = name;
    }

    /** Текстовая метка локального видео. */
    public localVideoLabel: HTMLSpanElement = this.prepareVideoLabel();

    /** Центральная текстовая метка локального видео. */
    public centerLocalVideoLabel: HTMLSpanElement = this.prepareCenterVideoLabel();

    /** Контейнер с видеоэлементами. */
    private _allVideos = new Map<string, HTMLVideoElement>();
    public get allVideos(): Map<string, HTMLVideoElement>
    {
        return this._allVideos;
    }

    /** Видеоэлемент локального видео. */
    public get localVideo(): HTMLVideoElement | undefined
    {
        return this._allVideos.get('localVideo');
    }

    /** Чат. */
    public readonly chat = document.getElementById('chat') as HTMLDivElement;

    /** Поле для выбора файла. */
    public readonly fileInput = document.getElementById('fileInput') as HTMLInputElement;

    /** Контейнер с прогрессами отправки файлов. */
    public readonly filesProgress = document.getElementById('files-progress') as HTMLDivElement;

    /** Сообщение пользователя, отправляемое в чат. */
    public readonly messageText = document.getElementById('messageText') as HTMLTextAreaElement;

    /** Список разрешений захвата видеоизображения. */
    public readonly captureSettingsDisplay = document.getElementById('captureSettingsDisplay') as HTMLSelectElement;

    /** Список разрешений захвата веб-камеры. */
    public readonly captureSettingsCam = document.getElementById('captureSettingsCam') as HTMLSelectElement;

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

    /** Поле для ввода имени пользователя. */
    public readonly usernameInput = document.getElementById('usernameInput') as HTMLInputElement;

    /** Количество строк в раскладке. */
    private videoRows = 2;

    /** Количество столбцов в раскладке. */
    private videoColumns = 2;

    /** Текущая политика Mute для видео (свойство muted). */
    private mutePolicy = true;

    /** Звук-оповещение о входе нового пользователя. */
    public joinedSound = new Howl({ src: '/rooms/sounds/joined.mp3' });

    /** Звук-оповещение об уходе пользователя. */
    public leftSound = new Howl({ src: '/rooms/sounds/left.mp3' });

    constructor()
    {
        console.debug('[UI] > ctor');
        this.prepareMessageText();
        this.prepareLocalVideo();
        this.resizeVideos();
        window.addEventListener('resize', () => this.resizeVideos());

        const btn_toggleSounds = this.buttons.get('toggleSounds');
        btn_toggleSounds!.addEventListener('click', () =>
        { this.handleBtnToggleSounds(btn_toggleSounds!); });

        this.showUserName();

        const spritePlyr = document.createElement("div");
        spritePlyr.id = "sprite-plyr";
        //spritePlyr.innerHTML = atob(svgSprite.replace(/data:image\/svg\+xml;base64,/, ''));
        spritePlyr.innerHTML = svgSprite;
        document.body.append(spritePlyr);
    }

    /** Обработчик toogle-кнопки включения/выключения звуков собеседника. */
    private handleBtnToggleSounds(btn_toggleSounds: HTMLButtonElement): void
    {
        if (this.mutePolicy)
        {
            this.enableSounds();
            btn_toggleSounds.innerText = 'Выключить звуки собеседников';
            btn_toggleSounds.classList.replace('background-green', 'background-red');
            document.getElementById('attention')!.hidden = true;
        }
        else
        {
            this.disableSounds();
            btn_toggleSounds.innerText = 'Включить звуки собеседников';
            btn_toggleSounds.classList.replace('background-red', 'background-green');
            document.getElementById('attention')!.hidden = false;
        }
    }

    /** Добавить новое разрешение захватываемого видеоизображения. */
    public addCaptureSetting(settings: HTMLSelectElement, label: string, value: string): void
    {
        const newSetting = new Option(label, value);
        settings.add(newSetting);
    }

    /** Подготовить контейнер map с кнопками. */
    private prepareButtons(): Map<string, HTMLButtonElement>
    {
        const buttons = new Map<string, HTMLButtonElement>();

        buttons.set('getUserMediaMic', document.getElementById('btn_getUserMediaMic') as HTMLButtonElement);
        buttons.set('toggleMic', document.getElementById('btn_toggleMic') as HTMLButtonElement);
        buttons.set('getUserMediaCam', document.getElementById('btn_getUserMediaCam') as HTMLButtonElement);
        buttons.set('getDisplayMedia', document.getElementById('btn_getDisplayMedia') as HTMLButtonElement);
        buttons.set('sendMessage', document.getElementById('btn_sendMessage') as HTMLButtonElement);
        buttons.set('sendFile', document.getElementById('btn_sendFile') as HTMLButtonElement);
        buttons.set('toggleSounds', document.getElementById('btn_toggleSounds') as HTMLButtonElement);
        buttons.set('setNewUsername', document.getElementById('btn_setNewUsername') as HTMLButtonElement);
        buttons.set('stopMediaAudio', document.getElementById('btn_stopMediaAudio') as HTMLButtonElement);
        buttons.set('stopMediaVideo', document.getElementById('btn_stopMediaVideo') as HTMLButtonElement);

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
                this.buttons.get('sendMessage')!.click();
                this.messageText.value = '';
            }
        });
    }

    /** Установить новое имя для пользователя. */
    public setNewUsername(): void
    {
        localStorage['username'] = this.usernameInput.value;
        this.showUserName();
    }

    /** Показать имя пользователя. */
    private showUserName(): void
    {
        if (localStorage['username'] == undefined) localStorage['username'] = 'Гость';
        this.usernameInput.value = localStorage['username'] as string;
        this.localVideoLabel.innerText = localStorage['username'] as string;
        this.centerLocalVideoLabel.innerText = localStorage['username'] as string;
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
            if (video[0] != 'localVideo')
            {
                video[1].muted = disable;
            }
        }
        this.mutePolicy = disable;
    }

    /** Добавить новый видеоэлемент для нового собеседника. */
    public addVideo(remoteVideoId: string, name: string): void
    {
        const newVideoItem = document.createElement('div');
        newVideoItem.id = `remoteVideoItem-${remoteVideoId}`;
        newVideoItem.classList.add('videoItem');

        const videoLabel = this.prepareVideoLabel();
        videoLabel.innerText = name;
        videoLabel.id = `video-label-${remoteVideoId}`;
        videoLabel.hidden = true;
        newVideoItem.appendChild(videoLabel);

        const centerVideoLabel = this.prepareCenterVideoLabel();
        centerVideoLabel.innerText = name;
        centerVideoLabel.id = `center-video-label-${remoteVideoId}`;
        newVideoItem.appendChild(centerVideoLabel);

        const newVideo = document.createElement('video');
        newVideo.id = `remoteVideo-${remoteVideoId}`;
        newVideo.classList.add('video-js');
        newVideo.autoplay = true;
        newVideo.muted = this.mutePolicy;
        newVideo.poster = './images/novideodata.jpg';

        newVideoItem.appendChild(newVideo);

        document.getElementById('videos')!.appendChild(newVideoItem);
        this._allVideos.set(remoteVideoId, newVideo);

        this.prepareVideoPlayer(newVideo);

        // перестроим раскладку
        this.calculateLayout();
        this.resizeVideos();
    }

    /** Обновления текстовой метки видеоэлемента собеседника. */
    public updateVideoLabels(remoteVideoId: string, newName: string): void
    {
        this.getVideoLabel(remoteVideoId)!.innerText = newName;
        this.getCenterVideoLabel(remoteVideoId)!.innerText = newName;
    }

    /** Удалить видео собеседника (и обновить раскладку). */
    public removeVideo(id: string): void
    {
        const videoItem = document.getElementById(`remoteVideoItem-${id}`);
        if (videoItem)
        {
            // отвязываем стрим от UI видеоэлемента
            const videoElement = this._allVideos.get(id)!;
            videoElement.srcObject = null;
            // удаляем videoItem с этим id
            videoItem.remove();
            // удаляем видеоэлемент контейнера всех видеоэлементов
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
        for (const videoItem of document.getElementsByClassName('videoItem'))
        {
            (videoItem as HTMLDivElement).style.maxWidth = String(max_h * aspect_ratio) + 'px';
            (videoItem as HTMLDivElement).style.flexBasis = String(flexBasis) + 'px';
        }
    }

    /** Подготовить локальный видеоэлемент. */
    private prepareLocalVideo(): void
    {
        const localVideoItem = document.createElement('div');
        localVideoItem.classList.add('videoItem');

        localVideoItem.appendChild(this.localVideoLabel);
        localVideoItem.appendChild(this.centerLocalVideoLabel);

        const localVideo = document.createElement('video');
        localVideo.id = 'localVideo';
        localVideo.autoplay = true;
        localVideo.muted = true;
        localVideo.poster = './images/novideodata.jpg';

        localVideoItem.appendChild(localVideo);

        document.getElementById('videos')!.appendChild(localVideoItem);
        this._allVideos.set('localVideo', localVideo);

        this.prepareVideoPlayer(localVideo);
    }

    /** Подготовить плеер для локального видеоэлемента. */
    private prepareVideoPlayer(video: HTMLVideoElement)
    {
        const player = new Plyr(video, {
            ratio: '16:9',
            disableContextMenu: false,
            storage: { enabled: false },
            keyboard: { focused: false, global: false },
            clickToPlay: false,
            muted: (video.id == 'localVideo') ? true : this.mutePolicy,
            controls: ['play-large', 'play', 'mute', 'volume', 'pip', 'fullscreen'],
            loadSprite: false
        });

        // добавляем стиль (чтобы было как fluid у videojs)
        player.elements.container!.classList.add('videoContainer');
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

    /** Подготовить текстовую метку для локального видеоэлемента. */
    private prepareVideoLabel(): HTMLSpanElement
    {
        const label = document.createElement('span');
        label.classList.add('videoLabel');
        return label;
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

    public getCenterVideoLabel(userId: string) : HTMLSpanElement | null
    {
        return document.getElementById(`center-video-label-${userId}`);
    }

    public getVideoLabel(userId: string) : HTMLSpanElement | null
    {
        return document.getElementById(`video-label-${userId}`);
    }
}