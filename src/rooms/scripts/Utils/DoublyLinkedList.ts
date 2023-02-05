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

    public getFirst(): T | undefined
    {
        if (this.head !== undefined)
        {
            return this.head.value;
        }

        return undefined;
    }

    public getLast(): T | undefined
    {
        if (this.tail !== undefined)
        {
            return this.tail.value;
        }

        return undefined;
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

    public removeFirst()
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
            this.head = this.head!.next!;
            this.head.prev = undefined;
        }

        --this.size;
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
}
