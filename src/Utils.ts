import { Dispatch, SetStateAction } from "react";

export const getToggleFunc = (setState: Dispatch<SetStateAction<boolean>>) =>
{
    return () => { setState(prevState => !prevState); };
};