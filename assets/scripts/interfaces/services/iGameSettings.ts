export interface IGameSettings {
    setRows(value: number): void;
    getRows(): number;

    setCols(value: number): void;
    getCols(): number;

    getColWidth(): number;
    getRowHeight(): number;
    getPossibleStartBonuses(): number;
    getBonusChance(): number;

    getStartedMoves(): number;
    setStartedMoves(value: number): void;

    getTargetPoints(): number;
    setTargetPoints(value: number): void;

    getStartedBoosterReshuffle(): number;
    setStartedBoosterReshuffle(value: number): void;

    getStartedBoosterBomb(): number;
    setStartedBoosterBomb(value: number): void;
}