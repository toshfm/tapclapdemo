import { IQueue } from "../interfaces/IQueue";

export class Queue<T> implements IQueue<T> {
  private data: T[] = [];
  enqueue = (item: T) => this.data.push(item);
  dequeue = (): T | undefined => this.data.shift();
  count = (): number => this.data.length;
}