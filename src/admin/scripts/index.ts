import AdminAuthService from "./AdminAuthService";
import AdminSocketService from './AdminSocketService';

const joinButton = document.getElementById('btn-join');

if (!joinButton)
{
    const adminSocketService = new AdminSocketService();
}
else
{
    const adminAuthService = new AdminAuthService();
}