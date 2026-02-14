export interface IGameEvent {
    type: string;
    data?: any
}

export interface IObserver {
    onNotify(event: IGameEvent): void;
}

export interface IObservable {
    addObserver(observer: IObserver): void;
    removeObserver(observer: IObserver): void;
    notify(event: IGameEvent): void;
}