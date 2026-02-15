import { GAMEEVENT } from "../enums/gameEvent";
import { IEventEmitter, Listener } from "../interfaces/services/iEventEmitter";

export class EventEmitter implements IEventEmitter {
    private events: Map<GAMEEVENT, Set<Listener>> = new Map();

    public emit(event: GAMEEVENT, data?: any) {
        this.events.get(event)?.forEach(callback => callback(data));
    }

    public on(event: GAMEEVENT, callback: Listener): () => void {
        if (!this.events.has(event)) this.events.set(event, new Set());
        this.events.get(event).add(callback);
        return () => this.off(event, callback); // Возвращаем функцию отписки
    }

    public off(event: GAMEEVENT, callback: Listener) {
        this.events.get(event)?.delete(callback);
    }

    public removeAll(event?: GAMEEVENT): void {
         if (event !== undefined) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
    }
}