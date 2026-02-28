import type {Item, PlacedItem, SolverItem, PackResult} from '../types';
import {SOLVE_TIME_BUDGET_MS} from '../constants';
import {Grid} from './Grid';

// ─── Solver internals (not exported — SRP) ────────────────────────────────────

/** Mutable state carried through the recursion. */
interface SearchState {
    grid: Grid;
    items: SolverItem[];
    used: boolean[];
    current: PlacedItem[];
    currentCovered: number;
    /** Running sum of area of all unused items. Maintained incrementally. */
    remainingArea: number;
    /** Best solution found so far. */
    bestCovered: number;
    bestPlaced: PlacedItem[];
    /** Absolute deadline (ms since origin). */
    deadline: number;
    timedOut: boolean;
    /**
     * Amortized time-check counter.
     * We only call performance.now() every N nodes to avoid syscall overhead.
     */
    nodesUntilTimeCheck: number;
}

const TIME_CHECK_INTERVAL = 512;

// ─── Pre-validation (fail-fast for obvious edge cases) ────────────────────────

interface ValidationResult {
    /** Items that can possibly fit (at least one orientation fits in grid bounds). */
    feasible: SolverItem[];
    /** Items that cannot fit in any orientation — immediately unplaced. */
    unfeasible: SolverItem[];
}

/**
 * Single Responsibility: filter out items that can never fit regardless of
 * placement position. This runs in O(n) and catches the "item bigger than
 * grid" edge case instantly.
 */
function validateItems(items: SolverItem[], gridRows: number, gridCols: number): ValidationResult {
    const feasible: SolverItem[] = [];
    const unfeasible: SolverItem[] = [];

    for (const item of items) {
        let fits = false;
        for (const ori of item.orientations) {
            if (ori.h <= gridRows && ori.w <= gridCols) {
                fits = true;
                break;
            }
        }
        if (fits) feasible.push(item);
        else unfeasible.push(item);
    }

    return {feasible, unfeasible};
}

// ─── Core recursive solver ────────────────────────────────────────────────────

function solve(state: SearchState, scanHint: number): void {
    // ── Amortized time check ──────────────────────────────────────────────
    if (state.timedOut) return;
    if (--state.nodesUntilTimeCheck <= 0) {
        state.nodesUntilTimeCheck = TIME_CHECK_INTERVAL;
        if (performance.now() > state.deadline) {
            state.timedOut = true;
            return;
        }
    }

    // ── Upper-bound pruning ───────────────────────────────────────────────
    // If placing ALL remaining items still can't beat the best, prune.
    if (state.currentCovered + state.remainingArea <= state.bestCovered) return;

    // ── Find next free cell ───────────────────────────────────────────────
    const fi = state.grid.firstFree(scanHint);
    if (fi === -1) {
        // Grid is full — guaranteed best possible for this branch.
        if (state.currentCovered > state.bestCovered) {
            state.bestCovered = state.currentCovered;
            state.bestPlaced = [...state.current];
        }
        return;
    }

    const cols = state.grid.cols;
    const anchorRow = (fi / cols) | 0; // faster than Math.floor
    const anchorCol = fi % cols;

    // Update best-so-far if current partial is better.
    if (state.currentCovered > state.bestCovered) {
        state.bestCovered = state.currentCovered;
        state.bestPlaced = [...state.current];
    }

    // ── Try every unused item at the anchor ───────────────────────────────
    const {items, used, grid, current} = state;

    for (let ii = 0; ii < items.length; ii++) {
        if (used[ii]) continue;
        if (state.timedOut) return;

        const item = items[ii];

        for (const ori of item.orientations) {
            // Only try placements where the anchor cell is covered.
            const rMin = Math.max(0, anchorRow - ori.h + 1);
            const cMin = Math.max(0, anchorCol - ori.w + 1);
            const rMax = Math.min(anchorRow, grid.rows - ori.h);
            const cMax = Math.min(anchorCol, grid.cols - ori.w);

            for (let r = rMin; r <= rMax; r++) {
                for (let c = cMin; c <= cMax; c++) {
                    if (!grid.canPlace(r, c, ori.h, ori.w)) continue;

                    // Place
                    grid.fill(r, c, ori.h, ori.w, 1);
                    used[ii] = true;
                    state.currentCovered += item.area;
                    state.remainingArea -= item.area;
                    current.push({
                        id: item.id,
                        colorIndex: item.colorIndex,
                        row: r,
                        col: c,
                        h: ori.h,
                        w: ori.w,
                        rotated: ori.rotated,
                    });

                    solve(state, fi + 1);

                    // Un-place
                    current.pop();
                    state.remainingArea += item.area;
                    state.currentCovered -= item.area;
                    used[ii] = false;
                    grid.fill(r, c, ori.h, ori.w, 0);
                }
            }
        }
    }

    // ── Skip this cell (mark occupied, no item covers it) ─────────────────
    // Only worth doing if there is enough remaining item area to beat best
    // even after "wasting" this cell.
    if (state.currentCovered + state.remainingArea > state.bestCovered) {
        grid.setCell(anchorRow, anchorCol, 1);
        solve(state, fi + 1);
        grid.setCell(anchorRow, anchorCol, 0);
    }
}

// ─── Greedy pre-fill (fast heuristic before exhaustive search) ────────────────

/**
 * Greedy first-fit decreasing: place items largest-first at the first
 * available position. Runs in ≈ O(items × grid) and produces a reasonable
 * initial solution that tightens the branch-and-bound from the start.
 */
function greedyPrefill(grid: Grid, items: SolverItem[], used: boolean[]): PlacedItem[] {
    const placed: PlacedItem[] = [];

    for (let ii = 0; ii < items.length; ii++) {
        if (used[ii]) continue;
        const item = items[ii];
        let didPlace = false;

        for (const ori of item.orientations) {
            if (ori.h > grid.rows || ori.w > grid.cols) continue;

            for (let r = 0; r <= grid.rows - ori.h && !didPlace; r++) {
                for (let c = 0; c <= grid.cols - ori.w && !didPlace; c++) {
                    if (grid.canPlace(r, c, ori.h, ori.w)) {
                        grid.fill(r, c, ori.h, ori.w, 1);
                        used[ii] = true;
                        placed.push({
                            id: item.id,
                            colorIndex: item.colorIndex,
                            row: r,
                            col: c,
                            h: ori.h,
                            w: ori.w,
                            rotated: ori.rotated,
                        });
                        didPlace = true;
                    }
                }
            }
            if (didPlace) break;
        }
    }

    return placed;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Pack items into a father rectangle using a two-phase strategy:
 * 1. **Greedy** first-fit decreasing for an instant baseline.
 * 2. **Backtracking** branch-and-bound to improve upon the greedy result,
 *    with a time budget so large inputs never freeze the UI.
 *
 * Edge cases handled:
 * - Items larger than the grid in every orientation → immediately unplaced.
 * - Total item area > grid area → works correctly, excess items become unplaced.
 * - Zero items → instant 0% result.
 * - Grid fully filled by greedy → skips backtracking entirely.
 */
export function pack(fatherH: number, fatherW: number, items: Item[]): PackResult {
    const startTime = performance.now();
    const totalCells = fatherH * fatherW;

    // ── Fast path: no items ───────────────────────────────────────────────
    if (items.length === 0) {
        return {
            placed: [],
            unplaced: [],
            totalSquares: totalCells,
            coveredSquares: 0,
            coveragePercent: 0,
            timedOut: false,
            solveTimeMs: performance.now() - startTime,
        };
    }

    // ── Build solver items with precomputed area & orientations ───────────
    const allSolverItems: SolverItem[] = items.map((it, idx) => {
        const orientations = [{h: it.h, w: it.w, rotated: false}];
        if (it.h !== it.w) orientations.push({h: it.w, w: it.h, rotated: true});
        return {
            id: it.id,
            colorIndex: idx,
            h: it.h,
            w: it.w,
            area: it.h * it.w,
            orientations,
        };
    });

    // ── Pre-validation: reject items that can never fit ───────────────────
    const {feasible, unfeasible} = validateItems(allSolverItems, fatherH, fatherW);

    // ── Sort feasible items by area descending (better pruning) ───────────
    feasible.sort((a, b) => b.area - a.area);

    // ── Fast path: nothing can fit ────────────────────────────────────────
    if (feasible.length === 0) {
        return {
            placed: [],
            unplaced: allSolverItems.map((s) => ({
                id: s.id,
                h: s.h,
                w: s.w,
                colorIndex: s.colorIndex,
            })),
            totalSquares: totalCells,
            coveredSquares: 0,
            coveragePercent: 0,
            timedOut: false,
            solveTimeMs: performance.now() - startTime,
        };
    }

    // ── Phase 1: Greedy baseline ──────────────────────────────────────────
    const greedyGrid = new Grid(fatherH, fatherW);
    const greedyUsed: boolean[] = new Array(feasible.length).fill(false);
    const greedyPlaced = greedyPrefill(greedyGrid, feasible, greedyUsed);
    const greedyCovered = greedyPlaced.reduce((s, p) => s + p.h * p.w, 0);

    // If greedy filled the grid perfectly, no need to backtrack.
    if (greedyCovered === totalCells || greedyCovered === feasible.reduce((s, it) => s + it.area, 0)) {
        return buildResult(greedyPlaced, greedyCovered, feasible, unfeasible, totalCells, false, performance.now() - startTime);
    }

    // ── Phase 2: Backtracking improvement ─────────────────────────────────
    const grid = new Grid(fatherH, fatherW);
    const used: boolean[] = new Array(feasible.length).fill(false);
    const totalRemainingArea = feasible.reduce((s, it) => s + it.area, 0);

    const state: SearchState = {
        grid,
        items: feasible,
        used,
        current: [],
        currentCovered: 0,
        remainingArea: totalRemainingArea,
        bestCovered: greedyCovered,
        bestPlaced: [...greedyPlaced],
        deadline: performance.now() + SOLVE_TIME_BUDGET_MS,
        timedOut: false,
        nodesUntilTimeCheck: TIME_CHECK_INTERVAL,
    };

    solve(state, 0);

    return buildResult(
        state.bestPlaced,
        state.bestCovered,
        feasible,
        unfeasible,
        totalCells,
        state.timedOut,
        performance.now() - startTime,
    );
}

// ─── Result builder (SRP: separated from solving logic) ──────────────────────

function buildResult(
    placed: PlacedItem[],
    coveredSquares: number,
    feasible: SolverItem[],
    unfeasible: SolverItem[],
    totalCells: number,
    timedOut: boolean,
    solveTimeMs: number,
): PackResult {
    const placedIds = new Set(placed.map((p) => p.id));

    const unplacedFeasible = feasible
        .filter((it) => !placedIds.has(it.id))
        .map((it) => ({id: it.id, h: it.h, w: it.w, colorIndex: it.colorIndex}));
    const unplacedUnfeasible = unfeasible
        .map((it) => ({id: it.id, h: it.h, w: it.w, colorIndex: it.colorIndex}));

    const unplaced = [...unplacedFeasible, ...unplacedUnfeasible];

    return {
        placed,
        unplaced,
        totalSquares: totalCells,
        coveredSquares,
        coveragePercent: totalCells > 0
            ? Math.round((coveredSquares / totalCells) * 10000) / 100
            : 0,
        timedOut,
        solveTimeMs,
    };
}

