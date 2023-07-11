import { useEffect, useState } from "react";
import "./UserList.css";

import { UserInfo } from "nostromo-shared/types/RoomTypes";
import { Avatar } from "@mui/material";
import { MenuSectionLabel } from "../Menu/MenuItems";

interface UserListProps
{
    transitionDuration: number;
}

export const UserList: React.FC<UserListProps> = ({
    transitionDuration
}) =>
{
    const INDEX_OF_FIRST_SYMBOL = 0;

    const [userList, setUserList] = useState<UserInfo[]>([]);

    useEffect(() =>
    {
        const newUserList: UserInfo[] = [
            { id: "id111", name: "a_name1" },
            { id: "id222", name: "b_name2" },
            { id: "id333", name: "c_name3" }
        ];
        setUserList(newUserList);

    }, []);

    const userListToListItems = (user: UserInfo, index: number): JSX.Element =>
    {
        return (<>
            <div className="user-list-item clickable"
                key={index}
                tabIndex={-1}
                role="listitem"
                onClick={() => { console.log("test"); }}
            >
                <Avatar className="user-list-item-avatar" children={user.name[INDEX_OF_FIRST_SYMBOL]} />
                <div className="user-list-item-info">
                    <span className="user-list-item-info-name">{user.name}</span>
                    <span className="user-list-item-info-id">#{user.id}</span>
                </div>
            </div>
            {/* TODO: доделать контекстное меню. */}
        </>
        );
    };

    return (
        <div id="user-list-container" tabIndex={0}>
            <MenuSectionLabel text={`В сети — ${userList.length}`} />
            {userList.map(userListToListItems)}
        </div>
    );
};