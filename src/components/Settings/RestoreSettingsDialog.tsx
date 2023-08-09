import { Button } from "@mui/material";
import { FC, useEffect, useRef } from "react";
import { CiWarning } from "react-icons/ci";
import { FocusTrap } from "../Base/FocusTrap";
import "./SettingsParametersList.css";

interface RestoreSettingsDialogProps
{
    onConfirm: () => void;
    onCancel: () => void;
}

export const RestoreSettingsDialog: FC<RestoreSettingsDialogProps> = ({ onConfirm, onCancel }) =>
{
    const cancelRef = useRef<HTMLButtonElement>(null);

    useEffect(() =>
    {
        cancelRef.current?.focus();
    }, [cancelRef]);

    return (
        <div className="backdrop">
            <div className="settings-restore-panel">
                <CiWarning className="settings-restore-icon" />
                <p>Это действие приведёт к сбросу всех настроек.</p>
                <p>Вы уверены что хотите восстановить настройки по умолчанию?</p>
                <div className="settings-restore-buttons-container">
                    <FocusTrap>
                        <Button
                            className="settings-button warning"
                            onClick={onConfirm}
                        >
                            Да
                        </Button>
                        <Button
                            ref={cancelRef}
                            className="settings-button"
                            onClick={onCancel}
                        >
                            Нет
                        </Button>
                    </FocusTrap>
                </div>
            </div>
        </div>
    );
};
