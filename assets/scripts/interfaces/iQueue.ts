export interface IQueue<T> {
    enqueue(item: T);
    dequeue(): T;
    count(): number;
}