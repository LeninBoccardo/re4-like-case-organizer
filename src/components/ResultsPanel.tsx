import type {Item, PackResult} from '../types';
import {getColor, SOLVE_TIME_BUDGET_MS} from '../constants';
import {StatCard, SectionHeader, Panel} from './ui';
import {GridViz} from './GridViz';

interface ResultsPanelProps {
    result: PackResult | null;
    items: Item[];
    fatherH: number;
    fatherW: number;
    animKey: number;
}

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

                    {/* Timed-out warning */}
                    {result.timedOut && (
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
                                <div
                                    className="text-[11px] font-bold"
                                    style={{color: "#ffd60a", fontFamily: "'Space Mono', monospace"}}
                                >
                                    TIME LIMIT REACHED
                                </div>
                                <div
                                    className="text-[10px] mt-0.5"
                                    style={{color: "#666", fontFamily: "'Space Mono', monospace"}}
                                >
                                    Showing best result found within {SOLVE_TIME_BUDGET_MS / 1000}s — may not be optimal
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Grid visualization */}
                    <Panel className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        <SectionHeader label={`RESULT GRID — ${fatherH}H × ${fatherW}W`} accent="#4cc9f0"/>
                        <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden">
                            <GridViz result={result} fatherH={fatherH} fatherW={fatherW} animKey={animKey}/>
                        </div>
                    </Panel>

                    {/* Unplaced items */}
                    {result.unplaced.length > 0 && (
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
                                {result.unplaced.map((item) => {
                                    const color = getColor(item.colorIndex);
                                    return (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                                            style={{
                                                background: "rgba(239,68,68,0.08)",
                                                border: "1px solid rgba(239,68,68,0.2)",
                                            }}
                                        >
                                            <div
                                                className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0"
                                                style={{
                                                    background: `${color.bg}33`,
                                                    border: `1px solid ${color.bg}66`,
                                                    color: color.bg,
                                                    fontFamily: "'Space Mono', monospace",
                                                }}
                                            >
                                                {item.colorIndex + 1}
                                            </div>
                                            <div>
                                                <div
                                                    className="text-xs font-bold"
                                                    style={{color: "#ef4444", fontFamily: "'Space Mono', monospace"}}
                                                >
                                                    Item #{item.colorIndex + 1}
                                                </div>
                                                <div
                                                    className="text-[10px]"
                                                    style={{color: "#555", fontFamily: "'Space Mono', monospace"}}
                                                >
                                                    {item.h}H × {item.w}W · {item.h * item.w} sq
                                                </div>
                                            </div>
                                            <div
                                                className="ml-1.5 px-2 py-0.5 rounded-md text-[10px] tracking-widest"
                                                style={{
                                                    background: "rgba(239,68,68,0.15)",
                                                    color: "#ef4444",
                                                    fontFamily: "'Space Mono', monospace",
                                                }}
                                            >
                                                NO FIT
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Perfect pack banner */}
                    {result.unplaced.length === 0 && (
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
                                <div
                                    className="font-extrabold text-sm"
                                    style={{color: "#00f5d4", fontFamily: "'Syne', sans-serif"}}
                                >
                                    PERFECT PACK
                                </div>
                                <div
                                    className="text-[11px] mt-0.5"
                                    style={{color: "#555", fontFamily: "'Space Mono', monospace"}}
                                >
                                    All items placed successfully
                                </div>
                            </div>
                            <div
                                className="ml-auto text-2xl font-bold"
                                style={{color: "#00f5d4", fontFamily: "'Space Mono', monospace"}}
                            >
                                {result.coveragePercent}%
                            </div>
                        </div>
                    )}
                </>
            ) : (
                /* Placeholder */
                <div
                    className="flex-1 rounded-[18px] flex flex-col items-center justify-center gap-5"
                    style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px dashed rgba(255,255,255,0.07)",
                    }}
                >
                    <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
                        style={{background: "rgba(0,245,212,0.06)", border: "1px solid rgba(0,245,212,0.15)"}}
                    >
                        ▦
                    </div>
                    <div className="text-center">
                        <div
                            className="text-sm mb-1"
                            style={{color: "#444", fontFamily: "'Space Mono', monospace"}}
                        >
                            Configure your rectangle and items
                        </div>
                        <div
                            className="text-xs"
                            style={{color: "#2a2a2a", fontFamily: "'Space Mono', monospace"}}
                        >
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
            )}
        </div>
    );
}

