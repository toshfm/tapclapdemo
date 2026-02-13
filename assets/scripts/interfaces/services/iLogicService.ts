import { BLOCK } from "../../enums/block";
import { IInteractResponse } from "../iInteractResponse";

export interface ILogicService {
    prepareGrid() : void;
    isBonus(id: string): BLOCK | null;
    interact(id: string, useBomb?: boolean): IInteractResponse;
    reshuffle();
}

