import React, { useContext, useEffect, useRef, useState} from 'react';
import {ImAttachment} from 'react-icons/im';
import {MdSend} from 'react-icons/md';
import {BsFileEarmarkMedical} from 'react-icons/bs';
import {FcFile} from 'react-icons/fc';
import "./Chat.css";
import { Message } from './Message';
import { TooltipTopBottom } from '../../Tooltip';
import { Button } from '@mui/material';
import {DndContext } from '../../../App';

/** Информация о файле в чате. */
interface ChatFileInfo
{
    fileId: string;
    name: string;
    size: number;
}
/** Информация о сообщении в чате. */
interface ChatMessage
{
    userId: string;
    type: "text" | "file";
    datetime: number;
    content: string | ChatFileInfo;
}
const temp: ChatMessage[] = [];
/* для передачи на сервер */
const formData = new FormData();
let files = [];
export const Chat: React.FC = () =>
{
    /* Хук для перехвата сообщения */
    const [textMsg, setTextMsg] = useState("");
    /* Хук взятия пути для скачивания файла после вставки */
    const [pathFile, setPathFile] = useState("");
    /* Хук для перехвата изменения длины строки ввода (placeholder)*/
    const [checkPlaceH, setCheckPlaceH] = useState(true);
    /* Хук для отображения загружаемых файлов */
    const [isLoadFile, setFlagLF] = useState(false);
    /* Хук-контейнер для тестовых сообщений */
    const [msgs, setMsgs] = useState<ChatMessage[]>([
        {userId: "155sadjofdgknsdfk3", type: "text", datetime: (new Date().getTime())/2, content: "Hello, colleagues! "
        +"I think that everything will be fine with us, life is getting better, work is in full swing, the kettle is in the kitchen too." },
        {userId: "12hnjofgl33154", type: "text", datetime: new Date().getTime() - 20000, content: "Hello everyone! Yes! "
        + "Time goes by, nothing stands still. I am very glad that everything around is developing. I hope everything continues at the same pace." },
        {userId: "1bvcbjofg23fxcvds", type: "text", datetime: new Date().getTime() - 15000, content: "Hi all!" },
        {userId: "12hnjofgl33154", type: "text", datetime: new Date().getTime() - 10000, content: "Check this: https://bugs.documentfoundation.org/4р4рекарекрке456орпороен56оар5646666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666епопропаркепрке54н5445р4р45р5р45р54р4р6керкер " },
        {userId: "155sadjofdgknsdfk3", type: "file", datetime: new Date().getTime() - 5000, content: {fileId: "cxzvzx23", name: "Master_and_Margo.txt", size: 412428}},
        {userId: "12hnjofgl33154", type: "file", datetime: new Date().getTime(), content: {fileId: "jghjghj2", name: "About_IT.txt", size: 4212428}}
    ]);
    /* Хук-контейнер для тестовых файлов */
    const [testFiles, setFiles] = useState<ChatFileInfo[]>([
        {fileId : "hfg123", name: "Mr_Booble", size: 55500555},
        {fileId : "jhg312", name: "Ms_Cringe", size: 55500555},
        {fileId : "kjh366", name: "Book_Coolgfgkhkghghkhtoiktk", size: 55500555},
        {fileId : "loi785", name: "Merge_N2", size: 55500555},
        {fileId : "nbv890", name: "Fix_Price", size: 55500555},
        {fileId : "xcv519", name: "Jujutsu_C", size: 55500555},
        {fileId : "hfg123", name: "Mr_Booble", size: 55500555},
        {fileId : "jhg312", name: "Ms_Cringe", size: 55500555},
        {fileId : "kjh366", name: "Book_Coolgfgkhkghghkhtoiktk", size: 55500555},
        {fileId : "loi785", name: "Merge_N2", size: 55500555},
        {fileId : "nbv890", name: "Fix_Price", size: 55500555}
    ]);

    useEffect(() => {   
        // TODO: Добавить вывод смс;
    }, [textMsg]);

    /*const displayChatMessage = (() =>
    {
        const userId : string = "local"; 
        const datetime = new Date().toLocaleString() + "";
        const content = textMsg;

        const messageDiv = document.createElement("div");
        messageDiv.dataset.userId = userId;
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
        messageSenderName.innerText = "testname";//this.usernames.get(userId)!;
        messageSenderName.title = "testname";//this.usernames.get(userId)!;
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
        //messageTextDiv.innerHTML = wrapLinksInText(escapeHtmlTags(textMsg as string));

        const messageDateDiv = document.createElement("div");
        messageDateDiv.classList.add("message-date");
        messageDateDiv.innerText = datetime;//this.getTimestamp(datetime);

        messageDiv.appendChild(messageSenderDiv);
        messageDiv.appendChild(messageTextDiv);
        messageDiv.appendChild(messageDateDiv);

        //this.chat.append(messageDiv);
        //this.chat.scrollTop = this.chat.scrollHeight;
    });*/
    /*const displayChatLink=((message: ChatMessage)=>
    {
        const { userId, datetime } = message;

        const fileInfo = message.content as ChatFileInfo;

        const messageDiv = document.createElement('div');
        messageDiv.dataset.userId = userId;
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
        messageFileNameSpan.innerText = fileInfo.name;

        const messageFileSizeDiv = document.createElement('div');
        messageFileSizeDiv.className = "message-file-size bold";
        messageFileSizeDiv.innerText = `${(fileInfo.size / (1024 * 1024)).toFixed(3)} MB`;

        messageTextDiv.appendChild(messageFileLabelSpan);
        messageTextDiv.appendChild(messageFileNameSpan);
        messageTextDiv.appendChild(messageFileSizeDiv);

        const messageDateDiv = document.createElement('div');
        messageDateDiv.classList.add("message-date");
        messageDateDiv.innerText = this.getTimestamp(datetime);

        const messageLink = document.createElement('a');
        messageLink.classList.add("message-link");
        messageLink.href = `${window.location.origin}/files/${fileInfo.fileId}`;
        messageLink.target = "_blank";

        messageDiv.appendChild(messageSenderDiv);
        messageDiv.appendChild(messageTextDiv);
        messageDiv.appendChild(messageDateDiv);
        messageDiv.appendChild(messageLink);

        this.chat.append(messageDiv);
        this.chat.scrollTop = this.chat.scrollHeight;
    });*/
    const sendMsgOnClick = (() =>
    {
        const date = new Date().toLocaleString() + "";
        const chatElement : HTMLElement = document.getElementById("chat") as HTMLElement;
        chatElement.scrollTop = chatElement.scrollHeight;
        
        temp.push({userId: "1bvcbjofg23fxcvds", type: "text", datetime: new Date().getTime(), content: textMsg.trim()});
        setMsgs(temp);
        setFlagLF(false);
    });

    const sendMsgBoxRef = useRef<HTMLDivElement>(null);
    const sendMsg = (<>
        <div className="chat-btn-box non-selectable" ref={sendMsgBoxRef}>
            <TooltipTopBottom className="tooltip-send-btn" title="Отправить">
                <div className="btn-send-message">
                    <Button aria-label='Отправить'
                        onClick={sendMsgOnClick}
                        className='chat-btn-width'
                        accessKey='enter'
                    >
                        <MdSend className='btn-icon'/>
                    </Button>
                    <div className="chat-btn-clickable-area non-selectable" onClick={sendMsgOnClick}></div>
                </div>
            </TooltipTopBottom>
        </div>
    </>);
    /*** Кнопка отправки файлов ***/
    const fileComponent = useRef<HTMLInputElement>(null);
    // Тестовый прогресс бар
    const [data, setData ] = useState(0);
    useEffect(()=>{setTimeout(function () {
        setData(data+100000);
    }, 1000)},[data])

    const loadFileOnClick = (e: React.FormEvent<HTMLInputElement>) => {
        e.preventDefault();
        setFlagLF(true);
        const filesToUpload = fileComponent.current!.files;
        const formSent = new FormData();
        if (filesToUpload!.length > 0){
            for(const item in filesToUpload){
                formSent.append('file-input-btn', item);
                console.log(item);
            }
        } else {
            alert('Сначала выберите файл');
        }
        return false;
    }
    const removeCard = (fileId : string)=>{
        testFiles.map(f=>{
            if(f.fileId == fileId){
                testFiles.splice(testFiles.findIndex(t=>t.fileId==fileId), 1);
            }
        })
    }
    const InputHandler = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!e.shiftKey && e.code == 'Enter'){
            e.preventDefault();
            sendMsgOnClick();
        }
    }
    // проверка на выставление placeholder-а для поля ввода
    const checkPlaceholder = (text : string) => {
        if(!text.length)
            setCheckPlaceH(true);
        else
            setCheckPlaceH(false);
    }
    // Вставка файла через ctrl+v
    const pasteFile =(e : React.ClipboardEvent<HTMLDivElement>)=>{
        setFlagLF(true);
        setPathFile(e.clipboardData.getData("text"));
        files = [e.clipboardData.items];
        formData.append('file', e.clipboardData.items[1].getAsFile()!);
        console.log("size: " + (e.clipboardData.items[0].getAsFile()!.size/1000).toString() + "KB");
        console.log("name: " + e.clipboardData.items[1].getAsFile()!.name);
        console.log("type: " + e.clipboardData.items[1].getAsFile()!.type);
        e.preventDefault();
    }
    const loadFileBoxRef = useRef<HTMLDivElement>(null);
    const loadFile = (<>
        <div className="chat-btn-box non-selectable" ref={loadFileBoxRef}>
            <TooltipTopBottom className="tooltip-send-btn" title="Загрузить">
                <div className="btn-send-message">
                    <Button aria-label='Загрузить'
                        component='label'
                        className='chat-btn-width'>
                        <label>
                            <ImAttachment className='btn-icon'/>
                            <input type="file" id="file-input-btn" ref={fileComponent} onChange={e=>loadFileOnClick(e)} name="file" multiple hidden />
                        </label>
                    </Button>
                    <label className="chat-btn-clickable-area non-selectable" >
                        <input type="file" id="file-input-btn-area" ref={fileComponent} onChange={e=>loadFileOnClick(e)} name="file" multiple hidden />
                    </label>
                </div>
            </TooltipTopBottom>
        </div>
    </>);
    return (
            <><div id="chat" aria-readonly>
                {msgs.map(m=>{
                    return <Message key={m.userId + m.datetime.toString()} message={m}/>})
                }
            </div>
            
            <div className="input-area">
                {isLoadFile?
                    <div className='view-file-cards-area'> 
                    {testFiles.map(f=>{
                        return <div className='file-cards'>
                                <div className='remove-file-btn'
                                    onClick={e=>removeCard(f.fileId)}>Х</div>
                                <div className='file-cards-icon'><FcFile className='file-icon'/></div>
                                <div className='file-cards-icon'>{f.name.substring(0,16)}</div>
                                <progress id="progressBar" value={data} max={55500555}></progress>
                                <div className="progress-load">{(data/(1024 * 1024)).toFixed(3)}MB из {(f.size/(1024 * 1024)).toFixed(3)}MB</div>
                            </div>
                    })}
                    </div>
                :<></>
                }
                <div className='msg-input-area' style={{maxHeight: isLoadFile? 'calc(100% - 170px)' : 'calc(100% - 80px)'}}>
                    <div className="btn-container btn-upload-file-container">
                        {loadFile}
                    </div>
                    <div className='up-placeholder' 
                        onClick={e=>{setCheckPlaceH(false);
                        const element = document.getElementById("message-textarea") as HTMLElement;
                        element.focus()}}>
                    <div id="message-textarea"   
                        role="textbox" 
                        onKeyDown={e=>{InputHandler(e)}}
                        aria-multiline="true"
                        contentEditable="true"
                        title='Поле ввода сообщения'
                        onBlur={e=>checkPlaceholder(e.currentTarget.textContent as string)}
                        onPaste={e=>pasteFile(e)}
                        onInput={e=>{const tmp : HTMLDivElement = e.currentTarget; 
                                    const text : string = tmp.innerText;
                                    setTextMsg(text) }}>
                    </div>{checkPlaceH? <div className='down-placeholder'>Напишите сообщение...</div> : <></> }
                    </div>
                    <div className="btn-container btn-send-message-container">
                        {sendMsg}
                    </div>
                </div>
            </div>
        </>
    );
};