import React, { useCallback, useEffect, useState} from 'react';

import "./Chat.css";
import load_file from "../../../assets/images/file_load.svg";
import send_msg from "../../../assets/images/send_msg.svg";
import { FileMessage, TextMessage, Message } from './Message';

/* для передачи на сервер */
const formData = new FormData();
let files = [];

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
export const Chat: React.FC = () =>
{
    /* Хук для перехвата сообщения */
    const [textMsg, setTextMsg] = useState("");
    /* Хук для drag-n-drop */
    const [drag, setDrag] = useState(false);
    const [info, setInfo] = useState("");
    const [msgs, setMsgs] = useState<ChatMessage[]>([
        {userId: "155sadjofdgknsdfk3", type: "text", datetime: (new Date().getTime())/2, content: "Hello, colleagues! "
        +"I think that everything will be fine with us, life is getting better, work is in full swing, the kettle is in the kitchen too." },
        {userId: "12hnjofgl33154", type: "text", datetime: new Date().getTime(), content: "Hello everyone! Yes! "
        + "Time goes by, nothing stands still. I am very glad that everything around is developing. I hope everything continues at the same pace." },
        {userId: "1bvcbjofg23fxcvds", type: "text", datetime: new Date().getTime(), content: "Hi all!" },
        {userId: "12hnjofgl33154", type: "text", datetime: new Date().getTime(), content: "Check this: https://bugs.documentfoundation.org/4р4рекарекрке456орпороен56оар5646666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666епопропаркепрке54н5445р4р45р5р45р54р4р6керкер " },
        {userId: "155sadjofdgknsdfk3", type: "file", datetime: new Date().getTime(), content: {fileId: "cxzvzx23", name: "Master_and_Margo.txt", size: 412428}},
        {userId: "12hnjofgl33154", type: "file", datetime: new Date().getTime(), content: {fileId: "jghjghj2", name: "About_IT.txt", size: 4212428}}
    ]);

    useEffect(() => {   
        // TODO: Добавить вывод смс;
    }, [textMsg]);

    /* Перевод файла в область */
    const DragStartHandler = (e: React.DragEvent<HTMLDivElement>)=>{
        e.preventDefault()
        setDrag(true);
    }
    /* Перевод файла из области */
    const DragLeaveHandler = (e: React.DragEvent<HTMLDivElement>)=>{
        e.preventDefault()
        setDrag(false);
    }
    /* После того, как отпустили файл в область */
    const onDropHandler = (e: React.DragEvent<HTMLDivElement>) =>{
        e.preventDefault();
        files = [...e.dataTransfer.files]
        formData.append('file', files[0]);
        setInfo(files[0].name + " " + (files[0].size/1000).toString() + "KB");
        console.log(files[0].name + " " + (files[0].size/1000).toString() + "KB");
        setDrag(false);
    }

    
    

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
    const displayChatMessage = (() =>
    {
        const date = new Date().toLocaleString() + "";
        console.log(textMsg, date);
        
        
        temp.push({userId: "1bvcbjofg23fxcvds", type: "text", datetime: new Date().getTime(), content: textMsg});
        setMsgs(temp);
    });

    return (
        <>
            <section id="chat-section">
                <div className="frame">
                    {drag
                        ? <div className='drop-area-before'
                            onDragStart={e => DragStartHandler(e)}
                            onDragLeave={e => DragLeaveHandler(e)}
                            onDragOver={e => DragStartHandler(e)}
                            onDrop={e => onDropHandler(e)}
                        >Ператащите сюда файлы, если хотите загрузить их</div>
                        : <div 
                            
                            onDragLeave={e => DragLeaveHandler(e)}
                            onDragOver={e => DragStartHandler(e)}
                            >
                                <div id="chat" aria-readonly>
                                    {msgs.map(m=>{
                                        return <Message message={m}/>})
                                    }
                                </div>
                                
                                <div className="flex">
                                    <label className="btn-send-file-container">
                                        <img src={load_file} id='file_load_logo' alt="Нажмите для выбора файла." />
                                        <input type="file" id="file-input" name="file" multiple hidden />
                                    </label>
                                    <div id="message-textarea"   
                                        data-text="Введите ваше сообщение"
                                        role="textbox" 
                                        aria-multiline="true"
                                        contentEditable="true"
                                        onInput={e=>setTextMsg(e.currentTarget.textContent as string)}>
                                    </div>
                                    <div className="btn-send-message-container">
                                        <button
                                            className="btn-send-message" 
                                            type='button' 
                                            accessKey="enter" 
                                            onClick={displayChatMessage} 
                                            autoFocus>
                                            <img src={send_msg} className='send_msg' alt='Отправить'/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                    }
                </div>
                <div className='drop-area-beyond'></div>
            </section>
        </>
    );
};