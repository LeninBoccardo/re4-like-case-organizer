import type { Item, DimensionField } from '../types';
import { FONT_MONO, getColor } from '../constants';

interface ItemRowProps {
    item: Item;
    index: number;
    onChange: (index: number, field: DimensionField, value: number) => void;
    onRemove: (index: number) => void;
    animDelay: number;
}

/** Inline numeric input for a single dimension value (H or W). */
function DimensionInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
        <input
            type="number"
            min="1"
            max="20"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value) || 1)}
            className="text-center font-bold rounded-lg outline-none"
            style={{
                width: 44,
                padding: "5px 4px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                fontFamily: FONT_MONO,
                fontSize: 13,
            }}
        />
    );
}

/** A single item row with color badge, dimension inputs, area display, and remove button. */
export function ItemRow({ item, index, onChange, onRemove, animDelay }: ItemRowProps) {
    const color = getColor(index);

    return (
        <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${color.bg}33`,
                boxShadow: `0 0 12px ${color.bg}0d`,
                animation: `slideIn 0.3s ease ${animDelay}ms both`,
            }}
        >
            {/* Index badge */}
            <div
                className="shrink-0 flex items-center justify-center rounded-lg"
                style={{ width: 26, height: 26, background: color.bg, boxShadow: color.glow }}
            >
                <span style={{ color: color.text, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 11 }}>
                    {index + 1}
                </span>
            </div>

            <span className="text-[10px] tracking-widest shrink-0" style={{ color: "#555", fontFamily: FONT_MONO }}>
                H
            </span>
            <DimensionInput value={item.h} onChange={(v) => onChange(index, "h", v)} />

            <span className="text-[10px] shrink-0" style={{ color: "#333", fontFamily: "monospace" }}>
                ×
            </span>

            <span className="text-[10px] tracking-widest shrink-0" style={{ color: "#555", fontFamily: FONT_MONO }}>
                W
            </span>
            <DimensionInput value={item.w} onChange={(v) => onChange(index, "w", v)} />

            <span className="text-[10px] ml-1 shrink-0" style={{ color: "#3a3a3a", fontFamily: FONT_MONO }}>
                {item.h * item.w}sq
            </span>

            <button
                onClick={() => onRemove(index)}
                className="ml-auto shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-sm cursor-pointer transition-all duration-200 hover:scale-110"
                style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    color: "#ef4444",
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.25)"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
            >
                ×
            </button>
        </div>
    );
}
