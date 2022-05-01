import IndexSocketService from './IndexSocketService';
import AuthService from './AuthService';

// создаем обработчики интерфейса и обработчики сокетов

const roomList = document.getElementById('room-list') as HTMLDivElement;

if (roomList)
{
    const indexSocketHandlerInstance = new IndexSocketService();
}
else
{
    const authSocketHandlerInstance = new AuthService();
}