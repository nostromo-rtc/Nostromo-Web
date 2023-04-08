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