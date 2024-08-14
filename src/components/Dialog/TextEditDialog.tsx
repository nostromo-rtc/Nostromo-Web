/*
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>
    SPDX-FileCopyrightText: 2023-2024 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import React, { ChangeEventHandler, KeyboardEventHandler, MouseEventHandler, useState } from "react";

import { Button } from "@mui/material";
import { doNotHandleEvent } from "../../utils/Utils";
import { FocusTrap } from "../Base/FocusTrap";
import { Input } from "../Base/Input";

import "./TextEditDialog.css";

interface TextEditDialogBaseProps
{
    label: string;
    description?: JSX.Element | string;
    hint?: string;
    value?: string;
    allowEmptyValue?: boolean;
    onValueConfirm: (newValue: string) => void;
    onClose: () => void;
}

const TextEditDialogBase: React.FC<TextEditDialogBaseProps> = ({
    label,
    description,
    hint,
    value,
    allowEmptyValue = false,
    onValueConfirm,
    onClose
}) =>
{
    const [editedValue, setEditedValue] = useState<string>(value ?? "");

    const isDisabled = (editedValue.trim() === value
        || (!allowEmptyValue && editedValue.trim() === ""));

    const handleValueChange: ChangeEventHandler<HTMLInputElement> = (ev) =>
    {
        setEditedValue(ev.target.value);
    };

    const handleSaveClick: MouseEventHandler<HTMLButtonElement> = () =>
    {
        onValueConfirm(editedValue.trim());
    };

    const handleCloseByEscape: KeyboardEventHandler<HTMLDivElement> = (ev): void =>
    {
        if (ev.key === "Escape")
        {
            onClose();
        }
    };

    const descriptionElem = (description !== undefined
        ? <div className="text-edit-dialog-description">{description}</div>
        : <></>
    );

    return (
        <div className="backdrop"
            onClick={onClose}
            onKeyDown={handleCloseByEscape}
        >
            <FocusTrap>
                <div onClick={doNotHandleEvent} className="text-edit-dialog-container">
                    <div className="text-edit-dialog-label">{label}</div>
                    {descriptionElem}
                    <div className="text-edit-dialog-input-container">
                        <Input className="text-edit-dialog-input"
                            value={editedValue}
                            onChange={handleValueChange}
                        />
                        <div className="text-edit-dialog-input-hint">
                            {hint}
                        </div>
                    </div>
                    <div className="text-edit-dialog-actions-container">
                        <Button onClick={onClose} color="warning">Отмена</Button>
                        <Button disabled={isDisabled}
                            onClick={handleSaveClick}
                            color="primary"
                        >
                            Сохранить
                        </Button>
                    </div>
                </div>
            </FocusTrap>
        </div>
    );
};

interface TextEditDialogProps extends TextEditDialogBaseProps
{
    open: boolean;
}

export const TextEditDialog: React.FC<TextEditDialogProps> = ({ open, ...props }) =>
{
    return open
        ? <TextEditDialogBase {...props} />
        : <></>;
};
