import { IGridElement } from "./iGridElement";
import { IEventEmitter } from "./services/iEventEmitter";
import { IGameState } from "./services/iGameState";

export interface IInteractedBlock {
    interact(gridEl: IGridElement, state: IGameState, events?: IEventEmitter) : Array<IGridElement>
}