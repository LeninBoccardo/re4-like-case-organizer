export interface Item {
    id: string;
    h: number;
    w: number;
}

export interface PlacedItem {
    id: string;
    colorIndex: number;
    row: number;
    col: number;
    h: number;
    w: number;
    rotated: boolean;
}

export interface UnplacedItem extends Item {
    colorIndex: number;
}

export interface Orientation {
    h: number;
    w: number;
    rotated: boolean;
}

export interface PackResult {
    placed: PlacedItem[];
    unplaced: UnplacedItem[];
    totalSquares: number;
    coveredSquares: number;
    coveragePercent: number;
    timedOut: boolean;
}

/** Internal item used by the solver — carries the original array index as colorIndex. */
export interface SolverItem {
    id: string;
    colorIndex: number;
    h: number;
    w: number;
    area: number;
    orientations: Orientation[];
}

export interface ItemColor {
    bg: string;
    text: string;
    glow: string;
}
