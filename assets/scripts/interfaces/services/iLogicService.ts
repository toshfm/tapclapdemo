import { IInteractResponse } from "../iInteractResponse";

export interface ILogicService {
    prepareGrid() : void;
    isBooster(id: string): string | null;
    interact(id: string, useBomb?: boolean): IInteractResponse;
    reshuffle();
}

