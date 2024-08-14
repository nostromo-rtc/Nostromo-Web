/*
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

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
