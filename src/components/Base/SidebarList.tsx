/*
    SPDX-FileCopyrightText: 2023-2025 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import React, { FocusEventHandler } from "react";

import { List } from "../Base/List/List";
import { ListSectionLabel } from "../Base/List/ListItems";

import { NumericConstants as NC } from "../../utils/NumericConstants";

import "./SidebarList.css";

export interface ListEntry
{
    id: string;
    name: string;
    innerScroll?: boolean;
}

export interface ListEntries
{
    [key: string]: ListEntry;
}

interface SidebarListEntryProps extends React.HTMLAttributes<HTMLDivElement>
{
    isActive: boolean;
    entry: ListEntry;
    onSelectEntry: () => void;
    onFocus?: FocusEventHandler<HTMLDivElement>;
}

const SidebarListEntry: React.FC<SidebarListEntryProps> = ({
    isActive,
    entry,
    onSelectEntry,
    onFocus,
    ...props
}) =>
{
    const handleFocus: FocusEventHandler<HTMLDivElement> = (ev) =>
    {
        onSelectEntry();

        if (onFocus)
        {
            onFocus(ev);
        }
    };

    return (
        <div
            className={
                "sidebar-list-item non-selectable" +
                (isActive ? " sidebar-list-active" : "")
            }
            tabIndex={isActive ? NC.ZERO_TAB_IDX : NC.NEGATIVE_TAB_IDX}
            role="listitem"
            onFocus={handleFocus}
            {...props}
        >
            <div className="sidebar-list-item-info">
                <span className="sidebar-list-item-info-name">{entry.name}</span>
            </div>
        </div>
    );
};

interface SidebarListProps
{
    label: string;
    selectedEntryId: string;
    onSelectEntry: (entry: string) => void;
    entries: ListEntries;
}

export const SidebarList: React.FC<SidebarListProps> = ({
    label,
    selectedEntryId,
    onSelectEntry,
    entries
}) =>
{
    const entriesToMap = (entry: ListEntry): JSX.Element =>
    {
        return (
            <SidebarListEntry
                key={entry.id}
                isActive={entry.id === selectedEntryId}
                entry={entry}
                onSelectEntry={() => { onSelectEntry(entry.id); }}
            />
        );
    };

    return (
        <List className="sidebar-list">
            <ListSectionLabel text={label} />
            {Object.values(entries).map(entriesToMap)}
        </List>
    );
};
