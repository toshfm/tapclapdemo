import { GAMEEVENT } from "../../enums/gameEvent";

export type Listener = (data?: any) => void;

export interface IEventEmitter {
    emit(event: GAMEEVENT, data?: any): void

    on(event: GAMEEVENT, callback: Listener): () => void

    off(event: GAMEEVENT, callback: Listener)

    removeAll(event?: GAMEEVENT): void;
}