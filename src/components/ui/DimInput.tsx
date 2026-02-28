import { FONT_MONO } from '../../constants';

interface DimInputProps {
    label: string;
    value: number;
    onChange: (v: number) => void;
}

const LABELS: Record<string, string> = { H: "HEIGHT", W: "WIDTH" };

/** Numeric input for a single grid dimension (height or width). */
export function DimInput({ label, value, onChange }: DimInputProps) {
    return (
        <div className="flex-1">
            <div
                className="text-[10px] tracking-widest mb-1.5"
                style={{ color: "#555", fontFamily: FONT_MONO }}
            >
                {LABELS[label] ?? label}
            </div>
            <div className="relative">
                <input
                    type="number"
                    min="1"
                    max="20"
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value) || 1)}
                    className="w-full text-center text-2xl font-bold rounded-xl outline-none transition-all duration-200"
                    style={{
                        padding: "10px 14px",
                        background: "rgba(0,245,212,0.06)",
                        border: "1px solid rgba(0,245,212,0.2)",
                        color: "#00f5d4",
                        fontFamily: FONT_MONO,
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = "#00f5d4";
                        e.target.style.boxShadow = "0 0 16px #00f5d433";
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = "rgba(0,245,212,0.2)";
                        e.target.style.boxShadow = "none";
                    }}
                />
                <span
                    className="absolute right-2.5 top-2 text-[10px]"
                    style={{ color: "#00f5d433", fontFamily: FONT_MONO }}
                >
                    {label}
                </span>
            </div>
        </div>
    );
}
