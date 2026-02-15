import { BOOSTER } from "../../enums/booster";

export interface ILogicService {
    newLevel(): void;
    handleBlockClick(id: string): void;
    handleBoosterClick(booster: BOOSTER): void;
}

