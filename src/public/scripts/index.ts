import IndexSocketService from './IndexSocketService';
import AuthService from './AuthService';

const roomList = document.getElementById('room-list') as HTMLDivElement;

if (roomList)
{
    const indexSocketService = new IndexSocketService();
}
else
{
    const authService = new AuthService();
}