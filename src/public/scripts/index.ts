import IndexSocketService from './IndexSocketService';
import AuthSocketService from './AuthSocketService';

// создаем обработчики интерфейса и обработчики сокетов

if (window.location.pathname.search('rooms') == -1)
{
    const indexSocketHandlerInstance = new IndexSocketService();
}
else
{
    const authSocketHandlerInstance = new AuthSocketService();
}