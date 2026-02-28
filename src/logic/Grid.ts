/**
 * Flat grid backed by a Uint8Array.
 *
 * Responsibilities: store cell state, answer placement queries, track free cells.
 * All index arithmetic is inlined for hot-path performance.
 */
export class Grid {
    readonly rows: number;
    readonly cols: number;
    readonly totalCells: number;
    readonly data: Uint8Array;

    /** Number of cells currently marked as free (0). */
    private _freeCount: number;

    constructor(rows: number, cols: number) {
        this.rows = rows;
        this.cols = cols;
        this.totalCells = rows * cols;
        this.data = new Uint8Array(this.totalCells);
        this._freeCount = this.totalCells;
    }

    get freeCount(): number {
        return this._freeCount;
    }

    // ── Placement queries ─────────────────────────────────────────────────

    /** Can a rectangle of size h×w be placed with its top-left at (r, c)? */
    canPlace(r: number, c: number, h: number, w: number): boolean {
        if (r + h > this.rows || c + w > this.cols) return false;
        const data = this.data;
        const cols = this.cols;
        for (let dr = 0; dr < h; dr++) {
            const rowBase = (r + dr) * cols + c;
            for (let dc = 0; dc < w; dc++) {
                if (data[rowBase + dc]) return false;
            }
        }
        return true;
    }

    // ── Mutations ─────────────────────────────────────────────────────────

    /** Fill a rectangle with value `v`. Use v=1 to occupy, v=0 to free. */
    fill(r: number, c: number, h: number, w: number, v: number): void {
        const data = this.data;
        const cols = this.cols;
        const cells = h * w;
        for (let dr = 0; dr < h; dr++) {
            const rowBase = (r + dr) * cols + c;
            for (let dc = 0; dc < w; dc++) {
                data[rowBase + dc] = v;
            }
        }
        // v=1 → occupy → subtract cells; v=0 → free → add cells
        this._freeCount += v === 0 ? cells : -cells;
    }

    /** Set a single cell. */
    setCell(r: number, c: number, v: number): void {
        const idx = r * this.cols + c;
        const old = this.data[idx];
        this.data[idx] = v;
        if (old === 0 && v !== 0) this._freeCount--;
        else if (old !== 0 && v === 0) this._freeCount++;
    }

    // ── Queries ───────────────────────────────────────────────────────────

    /**
     * Index of the first free cell (scanning left-to-right, top-to-bottom),
     * starting the scan at `hint` to skip already-filled prefix.
     * Returns -1 if no free cell exists.
     */
    firstFree(hint: number = 0): number {
        const data = this.data;
        const len = this.totalCells;
        for (let i = hint; i < len; i++) {
            if (data[i] === 0) return i;
        }
        return -1;
    }
}
