import type { Item, PlacedItem, BestState, SolverItem, Orientation, PackResult } from '../types';
import { SOLVE_TIME_BUDGET_MS } from '../constants';
import { Grid } from './Grid';

function solve(
    grid: Grid,
    items: SolverItem[],
    used: boolean[],
    current: PlacedItem[],
    currentCovered: number,
    best: BestState,
): void {
    if (best.timedOut) return;
    if (performance.now() > best.deadline) {
        best.timedOut = true;
        return;
    }

    let maxExtra = 0;
    for (let i = 0; i < items.length; i++)
        if (!used[i]) maxExtra += items[i].h * items[i].w;
    if (currentCovered + maxExtra <= best.covered) return;

    const fi = grid.firstFree();
    if (fi === -1) {
        if (currentCovered > best.covered) {
            best.covered = currentCovered;
            best.placed = [...current];
        }
        return;
    }

    const anchorRow = Math.floor(fi / grid.cols);
    const anchorCol = fi % grid.cols;
    if (currentCovered > best.covered) {
        best.covered = currentCovered;
        best.placed = [...current];
    }

    for (let ii = 0; ii < items.length; ii++) {
        if (used[ii]) continue;
        if (best.timedOut) return;
        const item = items[ii];

        const orientations: Orientation[] = [{ h: item.h, w: item.w, rotated: false }];
        if (item.h !== item.w) orientations.push({ h: item.w, w: item.h, rotated: true });

        for (const ori of orientations) {
            const rMin = Math.max(0, anchorRow - ori.h + 1);
            const cMin = Math.max(0, anchorCol - ori.w + 1);
            for (let r = rMin; r <= anchorRow; r++) {
                for (let c = cMin; c <= anchorCol; c++) {
                    if (best.timedOut) return;
                    if (!grid.canPlace(r, c, ori.h, ori.w)) continue;
                    grid.mark(r, c, ori.h, ori.w, 1);
                    used[ii] = true;
                    current.push({
                        id: item.id,
                        colorIndex: item.colorIndex,
                        row: r,
                        col: c,
                        h: ori.h,
                        w: ori.w,
                        rotated: ori.rotated,
                    });
                    solve(grid, items, used, current, currentCovered + ori.h * ori.w, best);
                    current.pop();
                    used[ii] = false;
                    grid.mark(r, c, ori.h, ori.w, 0);
                }
            }
        }
    }

    grid.set(anchorRow, anchorCol, 1);
    solve(grid, items, used, current, currentCovered, best);
    grid.set(anchorRow, anchorCol, 0);
}

export function pack(fatherH: number, fatherW: number, items: Item[]): PackResult {
    const solverItems: SolverItem[] = items.map((it, idx) => ({
        id: it.id,
        colorIndex: idx,
        h: it.h,
        w: it.w,
    }));

    const sorted = [...solverItems].sort((a, b) => b.h * b.w - a.h * a.w);
    const used: boolean[] = new Array(sorted.length).fill(false);
    const grid = new Grid(fatherH, fatherW);
    const best: BestState = {
        covered: 0,
        placed: [],
        deadline: performance.now() + SOLVE_TIME_BUDGET_MS,
        timedOut: false,
    };
    solve(grid, sorted, used, [], 0, best);

    const placedIds = new Set(best.placed.map((p) => p.id));
    const idToIndex = new Map(items.map((it, idx) => [it.id, idx]));
    const unplaced = items
        .filter((i) => !placedIds.has(i.id))
        .map((i) => ({ ...i, colorIndex: idToIndex.get(i.id) ?? 0 }));
    const total = fatherH * fatherW;

    return {
        placed: best.placed,
        unplaced,
        totalSquares: total,
        coveredSquares: best.covered,
        coveragePercent: Math.round((best.covered / total) * 10000) / 100,
        timedOut: best.timedOut,
    };
}

