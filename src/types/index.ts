// ─── Domain Models ────────────────────────────────────────────────────────────

/** A user-defined item to be packed into the grid. */
export interface Item {
    readonly id: string;
    readonly h: number;
    readonly w: number;
}

/** An item that has been placed on the grid. */
export interface PlacedItem {
    readonly id: string;
    readonly colorIndex: number;
    readonly row: number;
    readonly col: number;
    readonly h: number;
    readonly w: number;
    readonly rotated: boolean;
}

/** An item that could not be placed. */
export interface UnplacedItem extends Item {
    readonly colorIndex: number;
}

/** A possible orientation (normal or rotated 90°). */
export interface Orientation {
    readonly h: number;
    readonly w: number;
    readonly rotated: boolean;
}

// ─── Solver Models ────────────────────────────────────────────────────────────

/** The result returned by the packing solver. */
export interface PackResult {
    readonly placed: PlacedItem[];
    readonly unplaced: UnplacedItem[];
    readonly totalSquares: number;
    readonly coveredSquares: number;
    readonly coveragePercent: number;
    readonly timedOut: boolean;
    /** Wall-clock time (ms) the solver took to produce this result. */
    readonly solveTimeMs: number;
}

/** Internal item used by the solver — carries precomputed data for performance. */
export interface SolverItem {
    readonly id: string;
    readonly colorIndex: number;
    readonly h: number;
    readonly w: number;
    readonly area: number;
    readonly orientations: Orientation[];
}

// ─── UI Models ────────────────────────────────────────────────────────────────

/** Color scheme for a single item in the visualization. */
export interface ItemColor {
    readonly bg: string;
    readonly text: string;
    readonly glow: string;
}

/** Dimension field identifier used by item editors. */
export type DimensionField = "h" | "w";
