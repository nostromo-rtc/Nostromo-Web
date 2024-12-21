import { UserModel } from "./UserModel";

export class GeneralSocketService
{
    private readonly m_userModel: UserModel = new UserModel();

    public constructor()
    {
        // TODO: get id from server
        this.m_userModel.setId("UsgHhiGI6UDkitt8GTUOl");
        this.m_userModel.setName("User");
    }

    public get userModel(): UserModel
    {
        return this.m_userModel;
    }

    public setUserName(name: string): void
    {
        if (name === this.m_userModel.getStateSnapshot().name)
        {
            return;
        }

        this.m_userModel.setName(name);
    }
}
