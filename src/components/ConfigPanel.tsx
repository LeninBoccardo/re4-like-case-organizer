import type { Item, DimensionField } from '../types';
import { FONT_MONO, FONT_DISPLAY } from '../constants';
import { Panel, SectionHeader, DimInput } from './ui';
import { ItemRow } from './ItemRow';

interface ConfigPanelProps {
    fatherH: number;
    fatherW: number;
    fatherArea: number;
    items: Item[];
    totalItemArea: number;
    solving: boolean;
    onFatherHChange: (v: number) => void;
    onFatherWChange: (v: number) => void;
    onItemChange: (index: number, field: DimensionField, value: number) => void;
    onItemRemove: (index: number) => void;
    onItemAdd: () => void;
    onSolve: () => void;
}

/** Left sidebar containing grid configuration, item list, and solve trigger. */
export function ConfigPanel({
    fatherH,
    fatherW,
    fatherArea,
    items,
    totalItemArea,
    solving,
    onFatherHChange,
    onFatherWChange,
    onItemChange,
    onItemRemove,
    onItemAdd,
    onSolve,
}: ConfigPanelProps) {
    return (
        <div
            className="flex flex-col gap-3 w-full lg:w-72 xl:w-80 shrink-0 overflow-hidden"
            style={{ animation: "fadeUp 0.6s ease 0.1s both" }}
        >
            {/* Father rectangle */}
            <Panel>
                <SectionHeader label="FATHER RECTANGLE" accent="#00f5d4" />
                <div className="flex gap-3">
                    <DimInput label="H" value={fatherH} onChange={onFatherHChange} />
                    <DimInput label="W" value={fatherW} onChange={onFatherWChange} />
                </div>
                <div
                    className="flex justify-between mt-3 px-3 py-2 rounded-xl"
                    style={{ background: "rgba(0,245,212,0.05)", border: "1px dashed rgba(0,245,212,0.15)" }}
                >
                    <span className="text-[11px]" style={{ color: "#555" }}>Total squares</span>
                    <span className="text-[11px] font-bold" style={{ color: "#00f5d4" }}>{fatherArea} sq</span>
                </div>
            </Panel>

            {/* Items list */}
            <Panel className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <SectionHeader
                    label="ITEMS"
                    accent="#f72585"
                    right={
                        <span className="text-[10px]" style={{ color: "#444" }}>
                            {items.length} items · {totalItemArea} sq
                        </span>
                    }
                />
                <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0 pr-0.5">
                    {items.map((item, i) => (
                        <ItemRow
                            key={item.id}
                            item={item}
                            index={i}
                            onChange={onItemChange}
                            onRemove={onItemRemove}
                            animDelay={i * 40}
                        />
                    ))}
                </div>
                <button
                    onClick={onItemAdd}
                    className="mt-3 w-full py-2.5 rounded-xl text-xs tracking-widest transition-all duration-200 cursor-pointer shrink-0"
                    style={{
                        border: "1px dashed rgba(247,37,133,0.3)",
                        background: "transparent",
                        color: "#f72585",
                        fontFamily: FONT_MONO,
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = "rgba(247,37,133,0.08)"; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                    + ADD ITEM
                </button>
            </Panel>

            {/* Solve button */}
            <button
                onClick={onSolve}
                disabled={solving}
                className="w-full py-4 rounded-2xl font-extrabold text-sm tracking-widest flex items-center justify-center gap-3 transition-all duration-200 shrink-0"
                style={{
                    fontFamily: FONT_DISPLAY,
                    background: "rgba(0,245,212,0.12)",
                    border: `2px solid ${solving ? "rgba(0,245,212,0.3)" : "#00f5d4"}`,
                    color: "#00f5d4",
                    cursor: solving ? "not-allowed" : "pointer",
                    boxShadow: "0 0 20px rgba(0,245,212,0.1)",
                }}
                onMouseOver={(e) => {
                    if (solving) return;
                    e.currentTarget.style.background = "#00f5d4";
                    e.currentTarget.style.color = "#001a16";
                    e.currentTarget.style.transform = "scale(1.02)";
                    e.currentTarget.style.boxShadow = "0 0 40px rgba(0,245,212,0.35)";
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.background = "rgba(0,245,212,0.12)";
                    e.currentTarget.style.color = "#00f5d4";
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 0 20px rgba(0,245,212,0.1)";
                }}
            >
                {solving ? (
                    <>
                        <div
                            className="w-4 h-4 rounded-full"
                            style={{
                                border: "2px solid rgba(0,245,212,0.3)",
                                borderTopColor: "#00f5d4",
                                animation: "spin 0.7s linear infinite",
                            }}
                        />
                        SOLVING...
                    </>
                ) : (
                    "▶  SOLVE PACKING"
                )}
            </button>
        </div>
    );
}
