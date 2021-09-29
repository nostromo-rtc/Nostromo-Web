import indexSocketHandler from './indexSocketHandler';
import authSocketHandler from './authSocketHandler';

// создаем обработчики интерфейса и обработчики сокетов

if (window.location.pathname.search('rooms') == -1)
{
    const indexSocketHandlerInstance = new indexSocketHandler();
}
else
{
    const authSocketHandlerInstance = new authSocketHandler();
}