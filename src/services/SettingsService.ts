/* eslint-disable @typescript-eslint/naming-convention */
type ParameterType = "Select" | "Slider" | "Switch";
type ParameterValue = boolean | number | string;

interface ParameterInfo
{
    name: string;
    description?: string;
    type: ParameterType;
    defaultValue: ParameterValue;
}

interface Group 
{
    [key: string]: ParameterValue;
}

interface Section
{
    [key: string]: Group;
}

interface Category
{
    [key: string]: Section;
}

// --- Категория Display --- //

interface DisplayRoomLayoutGroup extends Group
{
    displayInactiveVideos: ParameterValue;
    displayLocalVideos: ParameterValue;
}

interface DisplayRoomSection extends Section
{
    /** Параметры отображения видеораскладки. */
    layout: DisplayRoomLayoutGroup;
}

interface DisplayCategory extends Category
{
    /** Внешний вид комнаты? */
    room: DisplayRoomSection;
}

// --- Settings object --- //

interface Settings
{
    [key: string]: Category;

    /** Общие */
    general: Category;
    audio: Category;
    video: Category;
    /** Внешний вид / отображение */
    display: DisplayCategory;
}

/** Настройки по умолчанию. */
const defaultSettings: Settings =
{
    general:
    {

    },
    audio:
    {

    },
    video:
    {

    },
    display:
    {
        room:
        {
            layout:
            {
                displayInactiveVideos: true,
                displayLocalVideos: true
            }
        }
    }
};

// TODO: такой объект нужно будет считывать из localStorage 
// при инициализации программы.
// И при сохранении настроек, сохранять их в localStorage.
export const settings: Settings = defaultSettings;

// -- Info objects -- //

interface ParametersInfoMap 
{
    readonly [key: string]: ParameterInfo;

    "display.room.layout.displayInactiveVideos": ParameterInfo;
    "display.room.layout.displayLocalVideos": ParameterInfo;
}

// TODO: такие же объекты нужно и для других видов элементов (категории, секции, группы).
// На данный момент не знаю как лучше задавать объекты с информацией для тех же параметров, чтобы они были
// более тесно связаны с самими параметрами, и чтобы при этом это было не слишком громоздко и сложно.
export const parametersInfoMap: ParametersInfoMap = {
    "display.room.layout.displayInactiveVideos":
    {
        name: "Отображать неактивных участников",
        type: "Switch",
        defaultValue: defaultSettings.display.room.layout.displayInactiveVideos
    },
    "display.room.layout.displayLocalVideos":
    {
        name: "Отображать локальные видео",
        type: "Switch",
        defaultValue: defaultSettings.display.room.layout.displayLocalVideos
    }
};
