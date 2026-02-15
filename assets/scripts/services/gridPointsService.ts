import { IPoint } from "../interfaces/iPoint";
import { IGameSettings } from "../interfaces/services/iGameSettings";
import { IGridViewService } from "../interfaces/services/iGridPointsService";

export class GridViewService implements IGridViewService {
    private _gridPoints: (IPoint | null)[][];
    private settings: IGameSettings;

    constructor(settings: IGameSettings) {
        this.settings = settings;
    }

    initGridPoints(): void {
        let rows = this.settings.getRows();
        let cols = this.settings.getCols();
        this._gridPoints = Array(rows).fill(null).map(() => Array(cols).fill(null));
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.setGridPoint(row, col, {
                    x: this.settings.getColWidth() / 2 - cols * (this.settings.getColWidth() / 2) + col * this.settings.getColWidth(),
                    y: this.settings.getRowHeight() / 2 - rows * (this.settings.getRowHeight() / 2) + row * this.settings.getRowHeight()
                })
            }
        }
    }

    setGridPoint(row, col, point) {
        this._gridPoints[row][col] = point;
    }

    getGridPoint(row, col) {
        return this._gridPoints[row][col];
    }
}