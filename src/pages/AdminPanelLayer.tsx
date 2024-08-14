/*
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { useContext, useState } from "react";

import { SetShowAdminPanelContext } from "../App";
import { AdminPanelActionArea } from "../components/AdminPanel/AdminPanelActionArea";
import { AdminPanelCategoryList } from "../components/AdminPanel/AdminPanelCategoryList";
import { FocusTrap } from "../components/Base/FocusTrap";
import { SidebarView, SidebarViewMainArea } from "../components/Base/SidebarView";
import { NumericConstants as NC } from "../utils/NumericConstants";

import "./AdminPanelLayer.css";

export interface AdminPanelCategory
{
    id: string;
    name: string;
    innerScroll?: boolean;
}

export interface IAdminPanelCategories
{
    [key: string]: AdminPanelCategory;
    manageRooms: AdminPanelCategory;
    createRoom: AdminPanelCategory;
    blockByIp: AdminPanelCategory;
}

export const AdminPanelLayer: React.FC = () =>
{
    /// Список категорий админской панели.
    const categories: IAdminPanelCategories = {
        manageRooms: {
            id: "manage-rooms",
            name: "Управление комнатами",
            innerScroll: true
        },
        createRoom: { id: "create-room", name: "Создание комнаты" },
        blockByIp: { id: "block-by-ip", name: "Блокировка по IP" }
    } as const;

    const setShowAdminPanel = useContext(SetShowAdminPanelContext);

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
        <AdminPanelCategoryList
            selectedCategoryId={selectedCategoryId}
            setSelectedCategoryId={setSelectedCategoryId}
            categories={categories}
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
