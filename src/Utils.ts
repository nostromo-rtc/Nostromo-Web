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

/**
 * Переместить фокус от `currentFocus` к другому соседнему элементу.
 * У элемента `focusTarget`, к которому перемещают фокус, должен быть аттрибут `tabindex`.
 * @param currentFocus исходный элемент владеющий фокусом.
 * @param next если `true`, то фокус будет перемещен к *следующему* элементу, иначе к *предыдущему*.
 */
export function moveFocus(currentFocus: Element | null, next: boolean): void
{
    if (!currentFocus)
    {
        return;
    }

    let focusTarget = next
        ? currentFocus.nextElementSibling
        : currentFocus.previousElementSibling;

    while (focusTarget !== null
        && !focusTarget.hasAttribute('tabindex'))
    {
        focusTarget = next
            ? focusTarget.nextElementSibling
            : focusTarget.previousElementSibling;
    }

    if (focusTarget)
    {
        (focusTarget as HTMLElement).focus();
    }
}

/**
 * Переместить фокус в списке `list` к первому или последнему элементу.
 * У элемента списка `list`, к которому перемещают фокус, должен быть аттрибут `tabindex`.
 * @param list список, на элемент которого должен быть нацелен фокус.
 * @param begin если `true`, то фокус будет перемещен к *первому* элементу, иначе к *последнему*.
 */
export function moveFocusToListBoundary(list: Element | null, first: boolean): void
{
    if (!list)
    {
        return;
    }

    let focusTarget = first
        ? list.firstElementChild
        : list.lastElementChild;

    while (focusTarget !== null
        && !focusTarget.hasAttribute('tabindex'))
    {
        focusTarget = first
            ? focusTarget.nextElementSibling
            : focusTarget.previousElementSibling;
    }

    if (focusTarget)
    {
        (focusTarget as HTMLElement).focus();
    }
}

const BINARY_THOUSAND = 1024;

export const PrefixConstants = {
    KILO: BINARY_THOUSAND,
    MEGA: BINARY_THOUSAND * BINARY_THOUSAND,
    GIGA: BINARY_THOUSAND * BINARY_THOUSAND * BINARY_THOUSAND,
} as const;

export const ZERO_IDX = 0;

export const FILE_SIZE_PRESCISSION = 3;

export const IDX_STEP = 1;

export function cloneObject<T>(obj: T): T
{
    return JSON.parse(JSON.stringify(obj)) as T;
}
