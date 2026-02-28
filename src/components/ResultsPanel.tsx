import type {Item, PackResult, UnplacedItem} from '../types';
import {FONT_MONO, FONT_DISPLAY, SOLVE_TIME_BUDGET_MS, getColor} from '../constants';
import {StatCard, SectionHeader, Panel} from './ui';
import {GridViz} from './GridViz';

// ─── Sub-components (SRP: each renders one result section) ────────────────────

/** Yellow warning banner shown when the solver hit its time budget. */
function TimedOutBanner() {
    return (
        <div
            className="flex items-center gap-3 rounded-[14px] px-4 py-3 shrink-0"
            style={{
                background: "rgba(255,214,10,0.06)",
                border: "1px solid rgba(255,214,10,0.2)",
                animation: "slideIn 0.3s ease 0.2s both",
            }}
        >
            <span className="text-lg">⏱</span>
            <div>
                <div className="text-[11px] font-bold" style={{color: "#ffd60a", fontFamily: FONT_MONO}}>
                    TIME LIMIT REACHED
                </div>
                <div className="text-[10px] mt-0.5" style={{color: "#666", fontFamily: FONT_MONO}}>
                    Showing best result found within {SOLVE_TIME_BUDGET_MS / 1000}s — may not be optimal
                </div>
            </div>
        </div>
    );
}

/** Single badge for an unplaced item showing its color, label, dimensions, and "NO FIT" tag. */
function UnplacedItemBadge({item}: {item: UnplacedItem}) {
    const color = getColor(item.colorIndex);
    return (
        <div
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
            style={{background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)"}}
        >
            <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0"
                style={{
                    background: `${color.bg}33`,
                    border: `1px solid ${color.bg}66`,
                    color: color.bg,
                    fontFamily: FONT_MONO,
                }}
            >
                {item.colorIndex + 1}
            </div>
            <div>
                <div className="text-xs font-bold" style={{color: "#ef4444", fontFamily: FONT_MONO}}>
                    Item #{item.colorIndex + 1}
                </div>
                <div className="text-[10px]" style={{color: "#555", fontFamily: FONT_MONO}}>
                    {item.h}H × {item.w}W · {item.h * item.w} sq
                </div>
            </div>
            <div
                className="ml-1.5 px-2 py-0.5 rounded-md text-[10px] tracking-widest"
                style={{
                    background: "rgba(239,68,68,0.15)",
                    color: "#ef4444",
                    fontFamily: FONT_MONO,
                }}
            >
                NO FIT
            </div>
        </div>
    );
}

/** Red section listing all items that could not be placed. */
function UnplacedSection({unplaced}: {unplaced: UnplacedItem[]}) {
    return (
        <div
            className="rounded-[18px] p-4 shrink-0"
            style={{
                background: "rgba(239,68,68,0.04)",
                border: "1px solid rgba(239,68,68,0.15)",
                animation: "slideIn 0.4s ease 0.6s both",
            }}
        >
            <SectionHeader label="UNPLACED ITEMS" accent="#ef4444"/>
            <div className="flex flex-wrap gap-2">
                {unplaced.map((item) => (
                    <UnplacedItemBadge key={item.id} item={item}/>
                ))}
            </div>
        </div>
    );
}

/** Green success banner shown when all items were placed. */
function PerfectPackBanner({coveragePercent}: {coveragePercent: number}) {
    return (
        <div
            className="flex items-center gap-4 rounded-[18px] px-5 py-4 shrink-0"
            style={{
                background: "rgba(0,245,212,0.05)",
                border: "1px solid rgba(0,245,212,0.2)",
                animation: "slideIn 0.4s ease 0.6s both",
            }}
        >
            <span className="text-3xl">✦</span>
            <div>
                <div className="font-extrabold text-sm" style={{color: "#00f5d4", fontFamily: FONT_DISPLAY}}>
                    PERFECT PACK
                </div>
                <div className="text-[11px] mt-0.5" style={{color: "#555", fontFamily: FONT_MONO}}>
                    All items placed successfully
                </div>
            </div>
            <div className="ml-auto text-2xl font-bold" style={{color: "#00f5d4", fontFamily: FONT_MONO}}>
                {coveragePercent}%
            </div>
        </div>
    );
}

/** Empty-state placeholder shown before the first solve. */
function Placeholder({fatherH, fatherW}: {fatherH: number; fatherW: number}) {
    return (
        <div
            className="flex-1 rounded-[18px] flex flex-col items-center justify-center gap-5"
            style={{background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.07)"}}
        >
            <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
                style={{background: "rgba(0,245,212,0.06)", border: "1px solid rgba(0,245,212,0.15)"}}
            >
                ▦
            </div>
            <div className="text-center">
                <div className="text-sm mb-1" style={{color: "#444", fontFamily: FONT_MONO}}>
                    Configure your rectangle and items
                </div>
                <div className="text-xs" style={{color: "#2a2a2a", fontFamily: FONT_MONO}}>
                    then press SOLVE PACKING to see results
                </div>
            </div>
            <div
                className="grid gap-1 opacity-20"
                style={{gridTemplateColumns: `repeat(${Math.min(fatherW, 10)}, 1fr)`}}
            >
                {Array.from({length: Math.min(fatherH, 5) * Math.min(fatherW, 10)}, (_, i) => (
                    <div
                        key={i}
                        className="w-6 h-6 rounded"
                        style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px dashed rgba(255,255,255,0.1)",
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ResultsPanelProps {
    result: PackResult | null;
    items: Item[];
    fatherH: number;
    fatherW: number;
    animKey: number;
}

/** Right panel displaying solver results: stats, grid visualization, and status banners. */
export function ResultsPanel({result, items, fatherH, fatherW, animKey}: ResultsPanelProps) {
    return (
        <div
            className="flex-1 flex flex-col gap-3 min-h-0 min-w-0 overflow-hidden"
            style={{animation: "fadeUp 0.6s ease 0.2s both"}}
        >
            {result ? (
                <>
                    {/* Stats */}
                    <div className="flex gap-3 shrink-0">
                        <StatCard label="Coverage" value={result.coveragePercent} unit="%" accent="#00f5d4"
                                  decimals={1}/>
                        <StatCard label="Placed" value={result.placed.length} unit={`/${items.length}`}
                                  accent="#ffd60a"/>
                        <StatCard label="Squares" value={result.coveredSquares} unit={`/${result.totalSquares}`}
                                  accent="#4cc9f0"/>
                    </div>

                    {result.timedOut && <TimedOutBanner />}

                    {/* Grid visualization */}
                    <Panel className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        <SectionHeader label={`RESULT GRID — ${fatherH}H × ${fatherW}W`} accent="#4cc9f0"/>
                        <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden">
                            <GridViz result={result} fatherH={fatherH} fatherW={fatherW} animKey={animKey}/>
                        </div>
                    </Panel>

                    {result.unplaced.length > 0 && <UnplacedSection unplaced={result.unplaced} />}
                    {result.unplaced.length === 0 && <PerfectPackBanner coveragePercent={result.coveragePercent} />}
                </>
            ) : (
                <Placeholder fatherH={fatherH} fatherW={fatherW} />
            )}
        </div>
    );
}
