export interface IMatrix<T> {
    data: T[]
    rows: number
    cols: number
    set(row: number, col: number, value: T) : T
    get(row: number, col: number) : T
    setByIndex(index: number, value: T) : T
    length(): number
}
