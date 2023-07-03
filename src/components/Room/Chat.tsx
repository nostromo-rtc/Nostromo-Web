import React, { useCallback, useEffect, useState} from 'react';

import "./Chat.css";
import load_file from "../../assets/images/file_load.svg";
import send_msg from "../../assets/images/send_msg.svg";

/* для передачи на сервер */
const formData = new FormData();
let files = [];



/** Информация о сообщении в чате. */
interface ChatMessage
{
    userId: string;
    type: "text" | "file";
    datetime: number;
    content: string;
}

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
        {userId: "12hnjofgl33154", type: "text", datetime: new Date().getTime(), content: "Nice day to work, yeah?" },
        {userId: "155sadjofdgknsdfk3", type: "text", datetime: new Date().getTime(), content: "Yes" }
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

    const getUserName = (id : string)=>{
        if(id == "12hnjofgl33154"){
            return "Sergey";
        }
        else if(id == "155sadjofdgknsdfk3"){
            return "Vladislav";
        }
        else if(id == "1bvcbjofg23fxcvds"){
            return "Amin";
        }
    }
    /** Получить время в формате 00:00:00 (24 часа). */
    const getTimestamp=(datetime: number): string =>
    {
        const date = new Date(datetime);
        const current_date = new Date();

        let timestamp = "";

        // Если это тот же день.
        if (date.getDate() == current_date.getDate()
            && date.getMonth() == current_date.getMonth()
            && date.getFullYear() == current_date.getFullYear())
        {
            timestamp = date.toLocaleString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            });

            return timestamp;
        }
        else
        {
            timestamp = date.toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: '2-digit',
                minute: "2-digit",
                second: "numeric",
                hour12: false
            });
        }

        return timestamp;
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
    const displayChatMessage = (() =>
    {
        const date = new Date().toLocaleString() + "";
        console.log(textMsg, date);
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
                                    {msgs.map(e=>{
                                        const isSelfMsg = e.userId == "12hnjofgl33154"
                                        const userName = getUserName(e.userId);
                                        return <div className={isSelfMsg? 'self-message-area' : 'message-area'}>
                                            <div className={isSelfMsg? 'message-container text-right' : 'message-container text-left'}>
                                                <span className='user-name' title={userName}>{userName}</span>&nbsp;
                                                <span className='user-id' title={'#'+e.userId}>#{e.userId.substring(0, 4)}</span><br></br>
                                                <div className='message-body'>{e.content}</div>
                                                <div className='date-msg-right'>{getTimestamp(e.datetime)}</div>
                                            </div>
                                        </div>
                                    })}
                                </div>
                                <div className="flex">
                                    <label className="btn-send-message-container">
                                        <img src={load_file} id='file_load_logo' alt="Нажмите для выбора файла." />
                                        <input type="file" id="file-input" name="file" multiple hidden />
                                    </label>
                                    <textarea id="message-textarea" 
                                        placeholder="Введите ваше сообщение"
                                        onChange={e=>setTextMsg(e.target.value)}>
                                    </textarea>
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