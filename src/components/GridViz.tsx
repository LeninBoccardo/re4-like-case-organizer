import {useState, useEffect, useRef, useMemo} from 'react';
import type {PackResult, PlacedItem} from '../types';
import {FONT_MONO, GRID_CELL_GAP, REVEAL_STAGGER_MS, REVEAL_INITIAL_DELAY_MS, getColor} from '../constants';

interface GridVizProps {
    result: PackResult;
    fatherH: number;
    fatherW: number;
    animKey: number;
}

/** Builds a lookup from "row-col" → PlacedItem for O(1) cell queries. */
function buildCellMap(placed: PlacedItem[]): Record<string, PlacedItem> {
    const map: Record<string, PlacedItem> = {};
    for (const p of placed) {
        for (let r = p.row; r < p.row + p.h; r++) {
            for (let c = p.col; c < p.col + p.w; c++) {
                map[`${r}-${c}`] = p;
            }
        }
    }
    return map;
}

/** Interactive grid visualization with staggered reveal animation and color-coded legend. */
export function GridViz({result, fatherH, fatherW, animKey}: GridVizProps) {
    const [revealed, setRevealed] = useState<string[]>([]);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [cellSize, setCellSize] = useState(48);

    // Responsive cell sizing
    useEffect(() => {
        const ro = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;
            const availW = entry.contentRect.width - 48;
            const availH = entry.contentRect.height - 80;
            const byW = Math.floor(availW / fatherW) - 4;
            const byH = availH > 0 ? Math.floor(availH / fatherH) - 4 : 9999;
            setCellSize(Math.max(16, Math.min(80, byW, byH)));
        });
        if (containerRef.current) ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, [fatherW, fatherH]);

    // Staggered reveal animation
    useEffect(() => {
        setRevealed([]);
        if (!result) return;
        const sorted = [...result.placed].sort(
            (a, b) => a.row * 1000 + a.col - (b.row * 1000 + b.col),
        );
        const timers = sorted.map((item, i) =>
            setTimeout(
                () => setRevealed((prev) => [...prev, item.id]),
                i * REVEAL_STAGGER_MS + REVEAL_INITIAL_DELAY_MS,
            ),
        );
        return () => timers.forEach(clearTimeout);
    }, [animKey, result]);

    const cellMap = useMemo(() => buildCellMap(result.placed), [result.placed]);

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
                        const p = cellMap[`${r}-${c}`];
                        const isEmpty = p === undefined;
                        const isRevealed = !isEmpty && revealed.includes(p.id);
                        const color = !isEmpty ? getColor(p.colorIndex) : null;
                        const isTopLeft = !isEmpty && p.row === r && p.col === c;

                        return (
                            <div
                                key={`${r}-${c}`}
                                style={{
                                    width: cellSize,
                                    height: cellSize,
                                    borderRadius: 6,
                                    background: isRevealed && color ? color.bg : "rgba(255,255,255,0.04)",
                                    border: isRevealed && color
                                        ? `1px solid ${color.bg}aa`
                                        : "1px dashed rgba(255,255,255,0.1)",
                                    boxShadow: isRevealed && color ? color.glow : "none",
                                    transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                                    transform: isRevealed ? "scale(1)" : "scale(0.82)",
                                    opacity: isRevealed ? 1 : isEmpty ? 0.3 : 0.15,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    position: "relative",
                                    overflow: "hidden",
                                    flexShrink: 0,
                                }}
                            >
                                {isRevealed && color && isTopLeft && (
                                    <span
                                        style={{
                                            color: color.text,
                                            fontFamily: FONT_MONO,
                                            fontWeight: 700,
                                            fontSize: Math.max(9, cellSize * 0.28),
                                            zIndex: 2,
                                            userSelect: "none",
                                            letterSpacing: "-0.02em",
                                        }}
                                    >
                                        {p.colorIndex + 1}
                                    </span>
                                )}
                                {isRevealed && (
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
                    }),
                )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-2">
                {result.placed.map((p) => {
                    const color = getColor(p.colorIndex);
                    const isVisible = revealed.includes(p.id);
                    return (
                        <div
                            key={p.id}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                            style={{
                                background: isVisible ? `${color.bg}22` : "rgba(255,255,255,0.05)",
                                border: `1px solid ${isVisible ? color.bg + "88" : "rgba(255,255,255,0.1)"}`,
                                transition: "all 0.4s ease",
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
                                    boxShadow: isVisible ? color.glow : "none",
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

