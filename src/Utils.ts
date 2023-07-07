import { Dispatch, ReactEventHandler, SetStateAction } from "react";

export const getToggleFunc = (setState: Dispatch<SetStateAction<boolean>>) =>
{
    return () => { setState(prevState => !prevState); };
};

export const doNotHandleEvent: ReactEventHandler = (ev) =>
{
    ev.preventDefault();
    ev.stopPropagation();
};

export function isEmptyString(str: string): boolean
{
    const EMPTY_STRING_LEN = 0;
    return str.length === EMPTY_STRING_LEN;
}