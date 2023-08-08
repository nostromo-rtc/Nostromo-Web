import { FC, MouseEventHandler, useContext, useEffect, useRef, useState } from "react";
import "./SettingsParametersList.css";
import { Category, Group, ParametersInfoMap, Section, Settings, useSettings } from "../../services/SettingsService";
import { ListItemInput, ListItemSelect, ListItemSlider, ListItemSwitch } from "../Base/List/ListItems";
import { List } from "../Base/List/List";
import { SettingsContext } from "../../App";
import { CiWarning } from "react-icons/ci";
import { FocusTrap } from "../FocusTrap";
import { Button } from "@mui/material";

type MouseClickHandler = () => void;

interface SettingsRestoreConfirmPanelProps
{
    onConfirm: MouseClickHandler;
    onCancel:  MouseClickHandler;
}

const SettingsRestoreConfirmPanel: FC<SettingsRestoreConfirmPanelProps> = ({onConfirm, onCancel}) =>
{
    const cancelRef = useRef<HTMLButtonElement>(null);

    useEffect(() =>
    {
        cancelRef.current?.focus();
    }, [cancelRef]);

    return(
        <div className="settings-restore-panel">
            <CiWarning className="settings-restore-icon" />
            <p>Это действие приведёт к сбросу всех настроек.</p>
            <p>Вы уверены что хотите восстановить настройки по умолчанию?</p>
            <div className="settings-restore-buttons-container">
                <FocusTrap>
                    <div className="settings-default-button-area">
                        <Button
                            className="settings-button warning"
                            onClick={onConfirm}
                        >Да
                        </Button>
                    </div>
                    <div className="settings-default-button-area">
                        <Button
                            ref={cancelRef}
                            className="settings-button"
                            onClick={onCancel}
                        >Нет
                        </Button>
                    </div>
                </FocusTrap>
            </div>
        </div>
    )
}

interface SettingsParametersListProps
{
    parametersInfoMap: ParametersInfoMap;
    selectedCategory: string;
}

export const SettingsParametersList: FC<SettingsParametersListProps> = ({ parametersInfoMap, selectedCategory }) =>
{
    const settingsService = useContext(SettingsContext);
    const settings = useSettings(settingsService);

    const [showRestoreDialog, setShowRestoreDialog] = useState<boolean>(false);

    const handleRestoreSettingsClick: MouseEventHandler<HTMLButtonElement> = (): void =>
    {
        setShowRestoreDialog(true);
    }

    const handleRestoreSettingsConfirm: MouseClickHandler= (): void =>
    {
        settingsService.restoreToDefault();
        setShowRestoreDialog(false);
    }
    const handleRestoreSettingsCancel: MouseClickHandler = (): void =>
    {
        setShowRestoreDialog(false);
    }

    const handleSwitch = (section: string, group: string, param: string, val?: boolean): void =>
    {
        if (val !== undefined)
        {
            settingsService.setSettings((prev: Settings) => 
            {
                prev[selectedCategory][section][group][param] = val;
            });
        }
        else
        {
            settingsService.setSettings((prev: Settings) =>
            {
                const oldVal = prev[selectedCategory][section][group][param] as boolean;
                prev[selectedCategory][section][group][param] = !oldVal;
            });
        }
    };

    const handleSlider = (section: string, group: string, param: string, val: number): void =>
    {
        settingsService.setSettings((prev: Settings) => 
        {
            prev[selectedCategory][section][group][param] = val;
        });
    };

    const handleInput = (section: string, group: string, param: string, val: string): void =>
    {
        settingsService.setSettings((prev: Settings) => 
        {
            prev[selectedCategory][section][group][param] = val;
        });
    };

    const handleSelect = (section: string, group: string, param: string, val: string): void =>
    {
        settingsService.setSettings((prev: Settings) => 
        {
            prev[selectedCategory][section][group][param] = val;
        });
    };

    const loadParameter =
    (
        elements: JSX.Element[],
        groupMap: Group,
        category: string,
        section: string,
        group: string,
        parameter: string
    ): void =>
    {
        // TODO: аналогично с помощью такого `id` можно вытаскивать информацию
        // для рендера и других элементов (категории, секции, группы),
        // при наличии соответствующих объектов с информацией как parametersInfoMap 
        // для всех этих видов элементов.
        const parameterId = `${category}.${section}.${group}.${parameter}`;
        const paramValue = parametersInfoMap[parameterId];

        if (paramValue.type === "Switch")
        {
            elements.push(
                <ListItemSwitch
                    key={parameterId}
                    description={parametersInfoMap[parameterId].description}
                    text={parametersInfoMap[parameterId].name}
                    checked={groupMap[parameter] as boolean}
                    setChecked={(val) =>
                    {
                        handleSwitch(section, group, parameter, val);
                    }}
                />
            );
        }
        else if (paramValue.type === "Slider")
        {
            elements.push(
                <ListItemSlider
                    key={parameterId}
                    className="list-item"
                    text={parametersInfoMap[parameterId].name + ": " + groupMap[parameter].toString()}
                    value={Number(groupMap[parameter])}
                    setValue={(val) =>
                    {
                        handleSlider(section, group, parameter, val);
                    }}
                />
            );
        }
        else if (paramValue.type === "Input")
        {
            elements.push(
                <ListItemInput
                    key={parameterId}
                    description={parametersInfoMap[parameterId].description}
                    text={parametersInfoMap[parameterId].name}
                    value={groupMap[parameter] as string}
                    setValue={(val) =>
                    {
                        handleInput(section, group, parameter, val.toString());
                    }}
                />
            );
        }
        else if (paramValue.type as string === "Select")  // as string для проверки на получение недопустимого типа из хранилища
        {
            const selectList: string[] = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth"];
            elements.push(
                <ListItemSelect
                    key={parameterId}
                    list={selectList}
                    value={groupMap[parameter] as string}
                    setValue={(val) =>
                    {
                        handleSelect(section, group, parameter, val.toString());
                    }}
                    description={parametersInfoMap[parameterId].description}
                    text={parametersInfoMap[parameterId].name}
                />
            );
        }
        // Сброс настроек
        // FIXME: Смотри сервис, я туда добавил новый тип
        else if(paramValue.type as string === "Button")
        {
            elements.push(
                <div className="settings-restore-area">
                    <label>{parametersInfoMap[parameterId].name}</label>
                    <div className="settings-default-button-area">
                        <button key={parameterId}
                            className="settings-button warning"
                            onClick={handleRestoreSettingsClick} 
                        >Сбросить настройки
                        </button>
                    </div>
                </div>
            );
        }
        else
        {
            elements.push(
                <div key={parameterId}>
                    {parametersInfoMap[parameterId].name}
                </div>
            );
        }
    };

    const loadGroup =
    (
        elements: JSX.Element[],
        sectionMap: Section,
        category: string,
        section: string,
        group: string
    ): void =>
    {
        const groupId = `${category}.${section}.${group}`;
        elements.push(
            <p className="settings-group-label" key={groupId}>{group}</p>
        );

        const groupMap = sectionMap[group];
        for (const parameter in groupMap)
        {
            loadParameter(elements, groupMap, category, section, group, parameter);
        }
    };

    const loadSection =
    (
        elements: JSX.Element[],
        categoryMap: Category,
        category: string,
        section: string
    ): void =>
    {
        const sectionId = `${category}.${section}`;
        elements.push(
            <p className="settings-section-label" key={sectionId}>{section}</p>
        );

        const sectionMap = categoryMap[section];
        for (const group in sectionMap)
        {
            loadGroup(elements, sectionMap, category, section, group);
        }
    };

    const loadSelectedCategory = (): JSX.Element[] =>
    {
        const parametersList: JSX.Element[] = [
            <p className="settings-category-label" key={selectedCategory}>{selectedCategory}</p>
        ];

        const categoryMap = settings[selectedCategory];
        for (const section in categoryMap)
        {
            loadSection(parametersList, categoryMap, selectedCategory, section);
        }

        return parametersList;
    };

    return (
        <>
            {showRestoreDialog ? 
                <div className="backdrop">
                    <SettingsRestoreConfirmPanel
                        onConfirm={handleRestoreSettingsConfirm}
                        onCancel={handleRestoreSettingsCancel}
                    />
                </div>
            : <></>}
            <List>{loadSelectedCategory()}</List>
        </>
    );
};
