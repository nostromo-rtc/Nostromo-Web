//TODO: Пока тут просто хранятся данные о комнатах. Потом можно будет тут реализовать связь фронта с бэком

export type UserInfo = {
    id: string,
    name: string;
};
export enum VideoCodec
{
    VP9 = 'VP9',
    VP8 = 'VP8',
    H264 = 'H264'
}

export interface PublicRoomInfo
{
    id: string;
    name: string;
    videoCodec: VideoCodec;
}

export const LoadedRoomList: PublicRoomInfo[] = [
    { id: "G_OShinfHXD", name: "Главная", videoCodec: VideoCodec.H264 },
    { id: "NV6oozYIm2T", name: "Netrunners", videoCodec: VideoCodec.H264 },
    { id: "Jqd0wDUDONo", name: "edu", videoCodec: VideoCodec.H264 },
    { id: "Y3OG7r9Qh6s", name: "Статус МОС", videoCodec: VideoCodec.H264 },
    { id: "q61oq10dUu5", name: "g", videoCodec: VideoCodec.H264 },
    { id: "3tzcDFnVEWz", name: "infedu", videoCodec: VideoCodec.H264 },
    { id: "9KT5a-wPftO", name: "mos-research", videoCodec: VideoCodec.H264 },
    { id: "KjWPqLcbHRi", name: "mos-devel", videoCodec: VideoCodec.H264 },
    { id: "inSdz0nbvA4", name: "vp9", videoCodec: VideoCodec.H264 },
    { id: "_efhN2j8tp1", name: "Предприятие 3826", videoCodec: VideoCodec.H264 },
    { id: "meD6afojFJY", name: "fam", videoCodec: VideoCodec.H264 },
    { id: "zaogu1TOQmu", name: "cco", videoCodec: VideoCodec.H264 },
    { id: "OkpHvA4_FxH", name: "hh", videoCodec: VideoCodec.H264 },
    { id: "_N4fIk3RfAe", name: "forall", videoCodec: VideoCodec.H264 },
    { id: "uMxk3nLNQP5", name: "Clio", videoCodec: VideoCodec.H264 },
];

export const LoadedUserList: UserInfo[] = [
    { id: "id111", name: "Первый" },
    { id: "id222", name: "Второй" },
    { id: "id333", name: "Третий" },
    { id: "id444", name: "Четвертый" },
    { id: "id555", name: "Пятый" },
    { id: "id666", name: "Шестой" },
    { id: "id777", name: "Седьмой" },
    { id: "id888", name: "Восьмой" },
    { id: "id999", name: "Девятый" },
    { id: "id123", name: "Десятый" }
];
