import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";

interface EditUsernameDialogProps
{
    open: boolean;
    prevName: string;
    setOpen: (isOpen: boolean) => void;
    setUsername: (name: string) => void;
}

export const EditUsernameDialog: React.FC<EditUsernameDialogProps> = ({ open, prevName, setOpen, setUsername }) =>
{
    const [newName, setNewName] = useState<string>();

    const handleClose = () =>
    {
        setOpen(false);
    };

    const handleSave = () =>
    {
        const trimmedName = newName?.trim();

        if (!newName
            || !trimmedName
            || trimmedName?.length === 0
            || prevName === newName
        )
        {
            return;
        }

        setUsername(trimmedName);
        setOpen(false);
    };

    const handleKeyDown: React.KeyboardEventHandler = (ev) =>
    {
        if (ev.key === "Enter")
        {
            handleSave();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Изменение имени</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Введите желаемое имя, которое будут видеть остальные пользователи.
                </DialogContentText>
                <TextField
                    margin="dense"
                    id="name"
                    label="Имя"
                    fullWidth
                    variant="outlined"
                    defaultValue={prevName}
                    onChange={(ev) => { setNewName(ev.currentTarget.value); }}
                    inputProps={{ onKeyDown: handleKeyDown }}
                    autoFocus
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="warning">Отмена</Button>
                <Button onClick={handleSave} color="primary">Сохранить</Button>
            </DialogActions>
        </Dialog>
    );
};