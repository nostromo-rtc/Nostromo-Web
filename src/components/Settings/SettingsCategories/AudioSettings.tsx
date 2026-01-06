/*
    SPDX-FileCopyrightText: 2026 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import React, { useContext } from "react";

import { SettingsContext } from "../../../AppWrapper";
import { ISettings } from "../../../services/Settings/Settings";
import { useSettings } from "../../../services/Settings/SettingsService";
import { List } from "../../Base/List/List";
import { ListItemSlider, ListItemSwitch } from "../../Base/List/ListItems";
import { SettingsCategoryProps } from "../SettingsParametersList";

export const AudioSettings: React.FC<SettingsCategoryProps> = ({ categoryName }) =>
{
    const settingsService = useContext(SettingsContext);
    const settings = useSettings(settingsService);

    return (
        <List className="flex-auto">
            <p className="settings-category-label">{categoryName}</p>
            <p className="settings-section-label">Микрофон</p>
            <p className="settings-group-label">Обработка звука</p>
            <ListItemSwitch
                label={"Включить шумоподавление"}
                description={"Данный вид шумоподавления устраняет статический шум, накладывая фильтр на определенный диапазон частот, что может влиять на общее качество и глубину голоса. Не устраняет динамичные шумы, такие как стуки, удары или фоновые звуки, доносящиеся с улицы."}
                value={settings.audio.mic.processing.enableNoiseSuppression}
                onValueChange={(val) =>
                {
                    settingsService.setSettings((prev: ISettings) =>
                    {
                        prev.audio.mic.processing.enableNoiseSuppression = val;
                    });
                }}
            />
            <ListItemSwitch
                label={"Включить эхоподавление"}
                description={"Устраняет эхо путем временного заглушения вашего звука в тот момент, когда говорит ваш собеседник. Это делается для того, чтобы звуки собеседника, доносящиеся из динамиков не попадали в ваш микрофон и не формировали звуковую 'петлю'. Рекомендуется включить, если вы используете колонки (включая динамики с ноутбука) вместо наушников."}
                value={settings.audio.mic.processing.enableEchoCancellation}
                onValueChange={(val) =>
                {
                    settingsService.setSettings((prev: ISettings) =>
                    {
                        prev.audio.mic.processing.enableEchoCancellation = val;
                    });
                }}
            />
            <p className="settings-group-label">Усиление звука</p>
            <ListItemSwitch
                label={"Включить автоматическую регулировку усиления"}
                description={"Управляет громкостью звука микрофона в реальном времени. Попробуйте выключить данный параметр и воспользоваться ручной регулировкой усиления, если наблюдаете проблемы с звуком (прерывающийся звук микрофона, усиливающийся фоновый шум)."}
                value={settings.audio.mic.gain.enableAutoGainControl}
                onValueChange={(val) =>
                {
                    settingsService.setSettings((prev: ISettings) =>
                    {
                        prev.audio.mic.gain.enableAutoGainControl = val;
                    });
                }}
            />
            <ListItemSwitch
                label={"Включить ручную регулировку усиления"}
                description={"Позволяет установить постоянное усиление звука микрофона вручную с помощью ползунка ниже."}
                showSeparator={false}
                value={settings.audio.mic.gain.enableManualGainControl}
                onValueChange={(val) =>
                {
                    settingsService.setSettings((prev: ISettings) =>
                    {
                        prev.audio.mic.gain.enableManualGainControl = val;
                    });
                }}
            />
            {/* TODO: выставить правильный диапазон для этого ползунка */}
            <ListItemSlider
                label={"Коэффициент усиления"}
                value={settings.audio.mic.gain.manualGain}
                onValueChange={(val) =>
                {
                    settingsService.setSettings((prev: ISettings) =>
                    {
                        prev.audio.mic.gain.manualGain = val;
                    });
                }}
            />
            <p className="settings-group-label">Шумовой порог</p>
            <ListItemSwitch
                label={"Включить шумовой порог"}
                description={"Позволяет включить шумовой порог и настроить его параметры. Порог заглушает звук микрофона при недостаточной громкости (например, когда вы не говорите, и слышно только фоновый шум), и активирует звук при достаточной громкости (например, когда вы начали говорить)."}
                showSeparator={false}
                value={settings.audio.mic.noiseGate.enableNoiseGate}
                onValueChange={(val) =>
                {
                    settingsService.setSettings((prev: ISettings) =>
                    {
                        prev.audio.mic.noiseGate.enableNoiseGate = val;
                    });
                }}
            />
            {/* TODO: выставить правильный диапазон для этого ползунка */}
            <ListItemSlider
                label={"Пороговое значение (дБ)"}
                showSeparator={false}
                value={settings.audio.mic.noiseGate.noiseGateThreshold}
                onValueChange={(val) =>
                {
                    settingsService.setSettings((prev: ISettings) =>
                    {
                        prev.audio.mic.noiseGate.noiseGateThreshold = val;
                    });
                }}
            />
            {/* TODO: выставить правильный диапазон для этого ползунка */}
            <ListItemSlider
                label={"Задержка (сек.)"}
                value={settings.audio.mic.noiseGate.noiseGateDelay}
                onValueChange={(val) =>
                {
                    settingsService.setSettings((prev: ISettings) =>
                    {
                        prev.audio.mic.noiseGate.noiseGateDelay = val;
                    });
                }}
            />
        </List>
    );
};
