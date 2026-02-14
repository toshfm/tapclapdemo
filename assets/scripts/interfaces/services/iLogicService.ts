import { BOOSTER } from "../../enums/booster";
import { IInteractResponse } from "../iInteractResponse";

export interface ILogicService {
    newLevel() : void;
    handleBlockClick(id: string): IInteractResponse;
    handleBoosterClick(booster: BOOSTER): void;
}

