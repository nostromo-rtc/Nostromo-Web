/*
    SPDX-FileCopyrightText: 2023-2025 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { NumericConstants } from "./NumericConstants";

class DoublyLinkedListNode<T>
{
    public m_value: T;
    public m_next?: DoublyLinkedListNode<T>;
    public m_prev?: DoublyLinkedListNode<T>;

    public constructor(value: T)
    {
        this.m_value = value;
    }
}

export class DoublyLinkedList<T>
{
    private m_head?: DoublyLinkedListNode<T>;
    private m_tail?: DoublyLinkedListNode<T>;

    private m_size: number;

    public constructor()
    {
        this.m_size = 0;
    }

    public length(): number
    {
        return this.m_size;
    }

    public isEmpty(): boolean
    {
        return this.m_size <= NumericConstants.EMPTY_LENGTH;
    }

    public getLast(): T | undefined
    {
        if (this.m_tail !== undefined)
        {
            return this.m_tail.m_value;
        }

        return undefined;
    }

    /** Get neighboring nodes: prev and next. */
    public getNeighboringNodes(value: T): [T | undefined, T | undefined]
    {
        if (this.isEmpty())
        {
            return [undefined, undefined];
        }

        let tmp = this.m_head;

        while (tmp !== undefined)
        {
            if (tmp.m_value === value)
            {
                return [tmp.m_prev?.m_value, tmp.m_next?.m_value];
            }

            tmp = tmp.m_next;
        }

        return [undefined, undefined];
    }

    public addFirst(value: T): void
    {
        const newNode = new DoublyLinkedListNode<T>(value);

        if (this.isEmpty())
        {
            this.m_tail = newNode;
        }
        else if (this.m_head !== undefined)
        {
            newNode.m_next = this.m_head;
            this.m_head.m_prev = newNode;
        }

        this.m_head = newNode;
        ++this.m_size;
    }

    public addLast(value: T): void
    {
        const newNode = new DoublyLinkedListNode<T>(value);

        if (this.isEmpty())
        {
            this.m_head = newNode;
        }
        else if (this.m_tail !== undefined)
        {
            newNode.m_prev = this.m_tail;
            this.m_tail.m_next = newNode;
        }

        this.m_tail = newNode;
        ++this.m_size;
    }

    public addBefore(beforeValue: T, newValue: T): void
    {
        if (this.isEmpty())
        {
            this.addLast(newValue);
        }

        const newNode = new DoublyLinkedListNode<T>(newValue);
        let tmp = this.m_head;

        while (tmp !== undefined)
        {
            if (tmp.m_value === beforeValue)
            {
                this.addNodeBefore(tmp, newNode);
                return;
            }

            tmp = tmp.m_next;
        }
    }

    public removeLast(): void
    {
        if (this.isEmpty())
        {
            return;
        }

        if (this.m_size === NumericConstants.ONE_LENGTH)
        {
            this.m_head = undefined;
            this.m_tail = undefined;
        }
        else
        {
            this.m_tail = this.m_tail?.m_prev;
            if (this.m_tail)
            {
                this.m_tail.m_next = undefined;
            }
        }

        --this.m_size;
    }

    public remove(value: T): void
    {
        if (this.isEmpty())
        {
            return;
        }

        let tmp = this.m_head;

        while (tmp !== undefined)
        {
            if (tmp.m_value === value)
            {
                this.removeNode(tmp);
                return;
            }

            tmp = tmp.m_next;
        }
    }

    private addNodeBefore(node: DoublyLinkedListNode<T>, newNode: DoublyLinkedListNode<T>): void
    {
        if (node.m_prev !== undefined)
        {
            newNode.m_prev = node.m_prev;
            newNode.m_prev.m_next = newNode;

            newNode.m_next = node;
            newNode.m_next.m_prev = newNode;

            ++this.m_size;
        }
        else
        {
            this.addFirst(newNode.m_value);
        }
    }

    private removeNode(node: DoublyLinkedListNode<T>): void
    {
        if (node.m_prev !== undefined)
        {
            node.m_prev.m_next = node.m_next;
        }
        else
        {
            this.m_head = node.m_next;
        }

        if (node.m_next !== undefined)
        {
            node.m_next.m_prev = node.m_prev;
        }
        else
        {
            this.m_tail = node.m_prev;
        }

        --this.m_size;
    }
}
