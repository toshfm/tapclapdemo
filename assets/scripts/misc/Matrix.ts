import { IMatrix } from "../interfaces/IMatrix"

export class Matrix<T> implements IMatrix<T> {
    _data: T[]
    _rows: number
    _cols: number

    get data() {
        return this._data
    }

    get rows() {
        return this._rows
    }

    get cols() {
        return this._cols
    }

    length() {
        return this._data.length;
    }
    
    constructor(rows, cols) {
        this._cols = cols;
        this._rows = rows;
        this._data = new Array(rows * cols).fill(0);
    }

    set(row, col, value)  {
        if (row >= this.rows || col >= this.cols) return;
        const index = col * this.rows + row;
        this._data[index] = value;
        return value;
    }

    get(row, col) {
        if (row >= this.rows || col >= this.cols) return undefined;
        return this._data[col * this.rows + row];
    }

    setByIndex(index, value) {
        this._data[index] = value
        return value;
    }
}