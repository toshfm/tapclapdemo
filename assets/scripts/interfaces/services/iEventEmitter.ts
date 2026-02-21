import { GameEvent } from "../../enums/GameEvent";

export type Listener = (data?: any) => void;

export interface IEventEmitter {
    emit(event: GameEvent, data?: any): void
    on(event: GameEvent, callback: Listener): () => void
    off(event: GameEvent, callback: Listener)
    removeAll(event?: GameEvent): void;
}