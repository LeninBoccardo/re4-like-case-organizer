export class Grid {
    rows: number;
    cols: number;
    data: Uint8Array;

    constructor(rows: number, cols: number) {
        this.rows = rows;
        this.cols = cols;
        this.data = new Uint8Array(rows * cols);
    }

    i(r: number, c: number): number {
        return r * this.cols + c;
    }

    canPlace(r: number, c: number, h: number, w: number): boolean {
        if (r + h > this.rows || c + w > this.cols) return false;
        for (let dr = 0; dr < h; dr++)
            for (let dc = 0; dc < w; dc++)
                if (this.data[this.i(r + dr, c + dc)]) return false;
        return true;
    }

    mark(r: number, c: number, h: number, w: number, v: number): void {
        for (let dr = 0; dr < h; dr++)
            for (let dc = 0; dc < w; dc++)
                this.data[this.i(r + dr, c + dc)] = v;
    }

    firstFree(): number {
        return this.data.indexOf(0);
    }

    set(r: number, c: number, v: number): void {
        this.data[this.i(r, c)] = v;
    }
}

