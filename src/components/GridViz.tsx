import {useState, useEffect, useRef, useMemo, memo} from 'react';
import type {PackResult, PlacedItem, ItemColor} from '../types';
import {FONT_MONO, GRID_CELL_GAP, REVEAL_STAGGER_MS, REVEAL_INITIAL_DELAY_MS, getColor} from '../constants';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Above this cell count, disable per-cell transitions and glow for performance. */
const PERF_CELL_THRESHOLD = 200;

// ─── Types ────────────────────────────────────────────────────────────────────

interface GridVizProps {
    result: PackResult;
    fatherH: number;
    fatherW: number;
    animKey: number;
}

interface CellProps {
    cellSize: number;
    item: PlacedItem | undefined;
    isRevealed: boolean;
    color: ItemColor | null;
    isTopLeft: boolean;
    enableEffects: boolean;
}

// ─── Cell (memoized — only re-renders when its own props change) ──────────────

const GridCell = memo(function GridCell({cellSize, item, isRevealed, color, isTopLeft, enableEffects}: CellProps) {
    const revealed = isRevealed && color;
    const isEmpty = item === undefined;

    return (
        <div
            style={{
                width: cellSize,
                height: cellSize,
                borderRadius: 6,
                background: revealed ? color!.bg : "rgba(255,255,255,0.04)",
                border: revealed
                    ? `1px solid ${color!.bg}aa`
                    : "1px dashed rgba(255,255,255,0.1)",
                boxShadow: revealed && enableEffects ? color!.glow : "none",
                transition: enableEffects ? "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" : "none",
                transform: revealed ? "scale(1)" : enableEffects ? "scale(0.82)" : "none",
                opacity: revealed ? 1 : isEmpty ? 0.3 : 0.15,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                flexShrink: 0,
            }}
        >
            {revealed && isTopLeft && (
                <span
                    style={{
                        color: color!.text,
                        fontFamily: FONT_MONO,
                        fontWeight: 700,
                        fontSize: Math.max(9, cellSize * 0.28),
                        zIndex: 2,
                        userSelect: "none",
                        letterSpacing: "-0.02em",
                    }}
                >
                    {item!.colorIndex + 1}
                </span>
            )}
            {revealed && enableEffects && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 55%)",
                        borderRadius: 6,
                        pointerEvents: "none",
                    }}
                />
            )}
        </div>
    );
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Builds a lookup from "row-col" → PlacedItem for O(1) cell queries. */
function buildCellMap(placed: PlacedItem[]): Map<string, PlacedItem> {
    const map = new Map<string, PlacedItem>();
    for (const p of placed) {
        for (let r = p.row; r < p.row + p.h; r++) {
            for (let c = p.col; c < p.col + p.w; c++) {
                map.set(`${r}-${c}`, p);
            }
        }
    }
    return map;
}

// ─── Main Component ───────────────────────────────────────────────────────────

/** Interactive grid visualization with staggered reveal animation and color-coded legend. */
export function GridViz({result, fatherH, fatherW, animKey}: GridVizProps) {
    const [revealedSet, setRevealedSet] = useState<Set<string>>(new Set());
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [cellSize, setCellSize] = useState(48);

    const totalCells = fatherH * fatherW;
    const enableEffects = totalCells <= PERF_CELL_THRESHOLD;

    // Responsive cell sizing (debounced)
    useEffect(() => {
        let rafId: number | undefined;
        const ro = new ResizeObserver((entries) => {
            if (rafId !== undefined) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                const entry = entries[0];
                if (!entry) return;
                const availW = entry.contentRect.width - 48;
                const availH = entry.contentRect.height - 80;
                const byW = Math.floor(availW / fatherW) - 4;
                const byH = availH > 0 ? Math.floor(availH / fatherH) - 4 : 9999;
                setCellSize(Math.max(16, Math.min(80, byW, byH)));
            });
        });
        if (containerRef.current) ro.observe(containerRef.current);
        return () => {
            if (rafId !== undefined) cancelAnimationFrame(rafId);
            ro.disconnect();
        };
    }, [fatherW, fatherH]);

    // Staggered reveal animation (batched for large grids)
    useEffect(() => {
        setRevealedSet(new Set());
        if (!result || result.placed.length === 0) return;

        const sorted = [...result.placed].sort(
            (a, b) => a.row * 1000 + a.col - (b.row * 1000 + b.col),
        );

        // For large grids, reveal all at once to avoid N re-renders
        if (!enableEffects) {
            const timer = setTimeout(() => {
                setRevealedSet(new Set(sorted.map((p) => p.id)));
            }, REVEAL_INITIAL_DELAY_MS);
            return () => clearTimeout(timer);
        }

        // For small grids, stagger for visual effect
        const timers = sorted.map((item, i) =>
            setTimeout(() => {
                setRevealedSet((prev) => {
                    const next = new Set(prev);
                    next.add(item.id);
                    return next;
                });
            }, i * REVEAL_STAGGER_MS + REVEAL_INITIAL_DELAY_MS),
        );
        return () => timers.forEach(clearTimeout);
    }, [animKey, result, enableEffects]);

    const cellMap = useMemo(() => buildCellMap(result.placed), [result.placed]);

    // Precompute color map once (not per cell)
    const colorMap = useMemo(() => {
        const map = new Map<number, ItemColor>();
        for (const p of result.placed) {
            if (!map.has(p.colorIndex)) map.set(p.colorIndex, getColor(p.colorIndex));
        }
        return map;
    }, [result.placed]);

    return (
        <div ref={containerRef} className="flex flex-col items-center gap-4 w-full h-full">
            {/* Grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${fatherW}, ${cellSize}px)`,
                    gridTemplateRows: `repeat(${fatherH}, ${cellSize}px)`,
                    gap: `${GRID_CELL_GAP}px`,
                    padding: "16px",
                    background: "rgba(0,0,0,0.45)",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 0 60px rgba(0,0,0,0.5), inset 0 0 40px rgba(0,0,0,0.3)",
                }}
            >
                {Array.from({length: fatherH}, (_, r) =>
                    Array.from({length: fatherW}, (_, c) => {
                        const key = `${r}-${c}`;
                        const p = cellMap.get(key);
                        const isEmpty = p === undefined;
                        const isRevealed = !isEmpty && revealedSet.has(p.id);
                        const color = !isEmpty ? (colorMap.get(p.colorIndex) ?? null) : null;
                        const isTopLeft = !isEmpty && p.row === r && p.col === c;

                        return (
                            <GridCell
                                key={key}
                                cellSize={cellSize}
                                item={p}
                                isRevealed={isRevealed}
                                color={color}
                                isTopLeft={isTopLeft}
                                enableEffects={enableEffects}
                            />
                        );
                    }),
                )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-2">
                {result.placed.map((p) => {
                    const color = colorMap.get(p.colorIndex) ?? getColor(p.colorIndex);
                    const isVisible = revealedSet.has(p.id);
                    return (
                        <div
                            key={p.id}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                            style={{
                                background: isVisible ? `${color.bg}22` : "rgba(255,255,255,0.05)",
                                border: `1px solid ${isVisible ? color.bg + "88" : "rgba(255,255,255,0.1)"}`,
                                transition: enableEffects ? "all 0.4s ease" : "none",
                                opacity: isVisible ? 1 : 0.25,
                            }}
                        >
                            <div
                                className="shrink-0"
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 2,
                                    background: color.bg,
                                    boxShadow: isVisible && enableEffects ? color.glow : "none",
                                }}
                            />
                            <span
                                className="text-[10px] font-bold whitespace-nowrap"
                                style={{color: isVisible ? color.bg : "#888", fontFamily: FONT_MONO}}
                            >
                                #{p.colorIndex + 1} {p.h}×{p.w}{p.rotated ? " ↻" : ""}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

