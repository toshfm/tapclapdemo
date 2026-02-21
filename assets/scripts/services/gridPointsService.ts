import { IMatrix } from "../interfaces/IMatrix";
import { IPoint } from "../interfaces/IPoint";
import { IGameSettings } from "../interfaces/services/IGameSettings";
import { IGridPointsService } from "../interfaces/services/IGridPointsService";
import { Matrix } from "../misc/Matrix";

export class GridPointsService implements IGridPointsService {
    private _gridPoints: IMatrix<IPoint>;
    private settings: IGameSettings;

    constructor(settings: IGameSettings) {
        this.settings = settings;
    }

    get gridPoints() {
        return this._gridPoints
    }

    initGridPoints(): void {
        let rows = this.settings.rows;
        let cols = this.settings.cols;
        let colWitdh = this.settings.colWidth;
        let rowHeight = this.settings.rowHeight;
        this._gridPoints = new Matrix<IPoint>(rows, cols);
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this._gridPoints.set(row, col, {
                    x: colWitdh / 2 - cols * (colWitdh / 2) + col * colWitdh,
                    y: rowHeight / 2 - rows * (rowHeight / 2) + row * rowHeight
                })
            }
        }
    }
}