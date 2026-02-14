import { IGameEvent, IObservable, IObserver } from "../interfaces/iObserver";

export class Observable implements IObservable {
    private observers: Set<IObserver> = new Set();

    public addObserver(observer: IObserver): void {
        this.observers.add(observer);
    }

    public removeObserver(observer: IObserver): void {
        this.observers.delete(observer);
    }

    public notify(event: IGameEvent): void {
        this.observers.forEach(observer => observer.onNotify(event));
    }
}