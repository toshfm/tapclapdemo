import { GameEvent, IEventMap } from "../enums/GameEvent";
import { IEventEmitter, Listener } from "../interfaces/services/IEventEmitter";


export class EventEmitter implements IEventEmitter {
    private events: Map<GameEvent, Set<Listener<any>>> = new Map();

    public emit<E extends keyof IEventMap>(event: E, data: IEventMap[E]) {
        this.events.get(event)?.forEach(callback => callback(data));
    }

    public on<E extends keyof IEventMap>(event: E, callback: Listener<IEventMap[E]>): () => void {
        if (!this.events.has(event)) this.events.set(event, new Set());
        this.events.get(event).add(callback);
        return () => this.off(event, callback); 
    }

    public off<E extends keyof IEventMap>(event: E, callback: Listener<IEventMap[E]>) {
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