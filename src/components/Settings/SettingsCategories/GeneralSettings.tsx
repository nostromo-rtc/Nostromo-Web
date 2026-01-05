/*
    SPDX-FileCopyrightText: 2026 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import React, { useContext, useRef, useState } from "react";

import { SettingsContext } from "../../../AppWrapper";
import { useSettings } from "../../../services/Settings/SettingsService";
import { List } from "../../Base/List/List";
import { ListItemButton, ListItemSwitch } from "../../Base/List/ListItems";
import { RestoreSettingsDialog } from "../RestoreSettingsDialog";
import { SettingsCategoryProps } from "../SettingsParametersList";
import { ISettings } from "../../../services/Settings/Settings";

export const GeneralSettings: React.FC<SettingsCategoryProps> = ({ categoryName }) =>
{
    const settingsService = useContext(SettingsContext);
    const settings = useSettings(settingsService);

    // Restore focus to button after closing dialog.
    const restoreSettingsBtnRef = useRef<HTMLButtonElement>(null);
    const [showRestoreSettingsDialog, setShowRestoreSettingsDialog] = useState<boolean>(false);

    const closeRestoreSettingsDialog = (): void =>
    {
        setShowRestoreSettingsDialog(false);
        restoreSettingsBtnRef.current?.focus();
    };

    const handleRestoreSettingsConfirm = (): void =>
    {
        settingsService.restoreToDefault();
        closeRestoreSettingsDialog();
    };

    const restoreSettingsDialog = (
        <RestoreSettingsDialog
            onConfirm={handleRestoreSettingsConfirm}
            onCancel={closeRestoreSettingsDialog}
        />
    );

    return (
        <List className="flex-auto">
            <p className="settings-category-label">{categoryName}</p>
            <p className="settings-section-label">Основные</p>

            <ListItemSwitch
                label={"Отображать уведомления"}
                description={"Позволяет включить всплывающие уведомления. Позже будет доступна возможность более детальной настройки уведомлений, включая возможность выключать уведомления определенных событий."}
                value={settings.general.main.enableNotifications}
                onValueChange={(val) =>
                {
                    settingsService.setSettings((prev: ISettings) =>
                    {
                        prev.general.main.enableNotifications = val;
                    });
                }}
            />

            <ListItemSwitch
                label={"Принудительно включить TCP-протокол (не рекомендуется)"}
                description={"Не рекомендуется включать данную опцию без необходимости. Позволяет принудительно включить использование TCP-протокола для передачи медиаданных вместо UDP-протокола, что может помочь при невозможности установить соединение для передачи медиаданных в следствие каких-либо неполадок с Интернетом со стороны клиента или сервера."}
                value={settings.general.main.enableIceTcpProtocol}
                onValueChange={(val) =>
                {
                    settingsService.setSettings((prev: ISettings) =>
                    {
                        prev.general.main.enableIceTcpProtocol = val;
                    });
                }}
            />

            <ListItemButton
                btnRef={restoreSettingsBtnRef}
                label={"Сбросить все настройки до стандартных"}
                btnLabel={"Сбросить найстроки"}
                onBtnClick={() => { setShowRestoreSettingsDialog(true); }}
            />

            {showRestoreSettingsDialog ? restoreSettingsDialog : <></>}
        </List>
    );
};
