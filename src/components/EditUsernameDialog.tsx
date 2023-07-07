import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions } from "@mui/material";
import React, { useState } from "react";
import { isEmptyString } from "../Utils";

type ButtonMouseEventHandler = React.MouseEventHandler<HTMLButtonElement>;

interface EditUsernameDialogProps
{
    open: boolean;
    prevName: string;
    setOpen: (isOpen: boolean) => void;
    setUsername: (name: string) => void;
}

export const EditUsernameDialog: React.FC<EditUsernameDialogProps> = ({ open, prevName, setOpen, setUsername }) =>
{
    const [newName, setNewName] = useState<string>("");

    const handleClose: ButtonMouseEventHandler = () =>
    {
        setOpen(false);
    };

    const handleSave = (): void =>
    {
        const trimmedName = newName.trim();

        if (isEmptyString(trimmedName) || prevName === newName)
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
        <Dialog open={open} onClose={handleClose} transitionDuration={100}>
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