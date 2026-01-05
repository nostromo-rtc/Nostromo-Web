/*
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { useContext, useState } from "react";

import { SetShowAdminPanelContext } from "../App";
import { AdminPanelActionArea } from "../components/AdminPanel/AdminPanelActionArea";
import { FocusTrap } from "../components/Base/FocusTrap";
import { ListEntry, SidebarList } from "../components/Base/SidebarList";
import { SidebarView, SidebarViewMainArea } from "../components/Base/SidebarView";

import { NumericConstants as NC } from "../utils/NumericConstants";

import "./AdminPanelLayer.css";

export interface IAdminPanelCategories
{
    [key: string]: ListEntry;
    manageRooms: ListEntry;
    createRoom: ListEntry;
    blockByIp: ListEntry;
}

export const AdminPanelLayer: React.FC = () =>
{
    const setShowAdminPanel = useContext(SetShowAdminPanelContext);

    const categories: IAdminPanelCategories = {
        manageRooms: {
            id: "manage-rooms",
            name: "Управление комнатами",
            innerScroll: true
        },
        createRoom: { id: "create-room", name: "Создание комнаты" },
        blockByIp: { id: "block-by-ip", name: "Блокировка по IP" }
    } as const;

    const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories.manageRooms.id);

    /**
     * Имеет ли данная категория `categoryId` элемент с внутренним скроллом
     * (например: компонент для поиска и внутренний список комнат).
     */
    const isCategoryHasInnerScroll = (categoryId: string): boolean =>
    {
        const category = Object.values(categories).find(c => c.id === categoryId);
        return (category !== undefined && category.innerScroll === true);
    };

    const handleClosePanel = (): void =>
    {
        if (setShowAdminPanel !== null)
        {
            setShowAdminPanel(false);
        }
    };

    const categoryList = (
        <SidebarList
            label="Панель администратора"
            selectedEntryId={selectedCategoryId}
            onSelectEntry={setSelectedCategoryId}
            entries={categories}
        />
    );

    const actionArea = (
        <SidebarViewMainArea className={
            isCategoryHasInnerScroll(selectedCategoryId)
                ? "sidebar-main-with-inner-scroll" : ""
        }>
            <AdminPanelActionArea
                selectedCategoryId={selectedCategoryId}
                categories={categories}
            />
        </SidebarViewMainArea>
    );

    return (
        <div id="layer-admin-panel"
            className="layer"
            tabIndex={NC.NEGATIVE_TAB_IDX}
        >
            <FocusTrap>
                <SidebarView
                    sidebar={categoryList}
                    main={actionArea}
                    onClickBtnClose={handleClosePanel}
                />
            </FocusTrap>
        </div>
    );
};
