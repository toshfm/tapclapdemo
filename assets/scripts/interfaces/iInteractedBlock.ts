import { IGridElement } from "./iGridElement";
import { IGameState } from "./services/iGameState";

export interface IInteractedBlock {
    interact(gridEl: IGridElement, state: IGameState) : Array<IGridElement>
}