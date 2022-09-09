class DoublyLinkedListNode<T>
{
    public value: T;
    public next?: DoublyLinkedListNode<T>;
    public prev?: DoublyLinkedListNode<T>;

    constructor(value: T)
    {
        this.value = value;
    }
}

export class DoublyLinkedList<T>
{
    private head?: DoublyLinkedListNode<T>;
    private tail?: DoublyLinkedListNode<T>;

    private size: number;

    constructor()
    {
        this.size = 0;
    }

    public length(): number
    {
        return this.size;
    }

    public isEmpty(): boolean
    {
        return this.size <= 0;
    }

    public getLast(): T | undefined
    {
        if (this.tail !== undefined)
        {
            return this.tail.value;
        }

        return undefined;
    }

    /** Вернуть соседние узлы: предыдущий и следующий. */
    public getNeighboringNodes(value: T): [T | undefined, T | undefined]
    {
        if (this.isEmpty())
        {
            return [undefined, undefined];
        }

        let tmp = this.head;

        while (tmp !== undefined)
        {
            if (tmp.value === value)
            {
                return [tmp.prev?.value, tmp.next?.value];
            }

            tmp = tmp.next;
        }

        return [undefined, undefined];
    }

    public addFirst(value: T)
    {
        const newNode = new DoublyLinkedListNode<T>(value);

        if (this.isEmpty())
        {
            this.tail = newNode;
        }
        else if (this.head !== undefined)
        {
            newNode.next = this.head;
            this.head.prev = newNode;
        }

        this.head = newNode;
        ++this.size;
    }

    public addLast(value: T)
    {
        const newNode = new DoublyLinkedListNode<T>(value);

        if (this.isEmpty())
        {
            this.head = newNode;
        }
        else if (this.tail !== undefined)
        {
            newNode.prev = this.tail;
            this.tail.next = newNode;
        }

        this.tail = newNode;
        ++this.size;
    }

    private addNodeBefore(node: DoublyLinkedListNode<T>, newNode: DoublyLinkedListNode<T>)
    {
        if (node.prev !== undefined)
        {
            newNode.prev = node.prev;
            newNode.prev.next = newNode;

            newNode.next = node;
            newNode.next.prev = newNode;

            ++this.size;
        }
        else
        {
            this.addFirst(newNode.value);
        }
    }

    public addBefore(beforeValue: T, newValue: T)
    {
        if (this.isEmpty())
        {
            this.addLast(newValue);
        }

        const newNode = new DoublyLinkedListNode<T>(newValue);
        let tmp = this.head;

        while (tmp !== undefined)
        {
            if (tmp.value === beforeValue)
            {
                this.addNodeBefore(tmp, newNode);
                return;
            }

            tmp = tmp.next;
        }
    }

    public removeLast()
    {
        if (this.isEmpty())
        {
            return;
        }

        if (this.size == 1)
        {
            this.head = undefined;
            this.tail = undefined;
        }
        else
        {
            this.tail = this.tail!.prev!;
            this.tail.next = undefined;
        }

        --this.size;
    }

    private removeNode(node: DoublyLinkedListNode<T>)
    {
        if (node.prev !== undefined)
        {
            node.prev.next = node.next;
        }
        else
        {
            this.head = node.next;
        }

        if (node.next !== undefined)
        {
            node.next.prev = node.prev;
        }
        else
        {
            this.tail = node.prev;
        }

        --this.size;
    }

    public remove(value: T)
    {
        if (this.isEmpty())
        {
            return;
        }

        let tmp = this.head;

        while (tmp !== undefined)
        {
            if (tmp.value === value)
            {
                this.removeNode(tmp);
                return;
            }

            tmp = tmp.next;
        }
    }
}
