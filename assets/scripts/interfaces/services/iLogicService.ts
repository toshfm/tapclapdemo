import { Booster } from "../../enums/Booster";

export interface ILogicService {
    newLevel(): void;
    handleBlockClick(id: string): void;
    handleBoosterClick(booster: Booster): void;
    checkWinLose(): void;
    addCollectedPoints(blockType?: string);
}

