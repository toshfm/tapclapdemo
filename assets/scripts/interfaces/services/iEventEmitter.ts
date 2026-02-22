import { GameEvent, IEventMap } from "../../enums/GameEvent";

export type Listener<T> = (data?: T) => void;

export interface IEventEmitter {
    emit<E extends keyof IEventMap>(event: E, data?: IEventMap[E]): void
    on<E extends keyof IEventMap>(event: E, callback: Listener<IEventMap[E]>): () => void
    off<E extends keyof IEventMap>(event: E, callback: Listener<IEventMap[E]>)
    removeAll(event?: GameEvent): void;
}