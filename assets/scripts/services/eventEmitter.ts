import { GameEvent } from "../enums/GameEvent";
import { IEventEmitter, Listener } from "../interfaces/services/IEventEmitter";

export class EventEmitter implements IEventEmitter {
    private events: Map<GameEvent, Set<Listener>> = new Map();

    public emit(event: GameEvent, data?: any) {
        this.events.get(event)?.forEach(callback => callback(data));
    }

    public on(event: GameEvent, callback: Listener): () => void {
        if (!this.events.has(event)) this.events.set(event, new Set());
        this.events.get(event).add(callback);
        return () => this.off(event, callback); // Возвращаем функцию отписки
    }

    public off(event: GameEvent, callback: Listener) {
        this.events.get(event)?.delete(callback);
    }

    public removeAll(event?: GameEvent): void {
         if (event !== undefined) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
    }
}