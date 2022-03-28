import IndexSocketService from './IndexSocketService';
import AuthSocketService from './AuthSocketService';

// создаем обработчики интерфейса и обработчики сокетов

const roomList = document.getElementById('roomList') as HTMLDivElement;

if (roomList)
{
    const indexSocketHandlerInstance = new IndexSocketService();
}
else
{
    const authSocketHandlerInstance = new AuthSocketService();
}