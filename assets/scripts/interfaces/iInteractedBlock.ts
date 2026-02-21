import { IGridElement } from "./IGridElement";
import { IEventEmitter } from "./services/IEventEmitter";
import { IGameState } from "./services/IGameState";

export interface IInteractedBlock {
    interact(gridEl: IGridElement, state: IGameState, events?: IEventEmitter) : Array<IGridElement>
}