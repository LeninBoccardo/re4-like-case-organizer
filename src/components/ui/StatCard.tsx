import { AnimatedNumber } from './AnimatedNumber';

interface StatCardProps {
    label: string;
    value: number;
    unit?: string;
    accent: string;
    decimals?: number;
}

export function StatCard({ label, value, unit, accent, decimals = 0 }: StatCardProps) {
    return (
        <div
            className="flex-1 rounded-2xl p-4"
            style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${accent}33`,
                boxShadow: `0 0 20px ${accent}0d`,
            }}
        >
            <div
                className="text-[10px] tracking-widest uppercase mb-1.5"
                style={{ color: "#666", fontFamily: "'Space Mono', monospace" }}
            >
                {label}
            </div>
            <div
                className="text-3xl font-bold leading-none"
                style={{ color: accent, fontFamily: "'Space Mono', monospace" }}
            >
                <AnimatedNumber value={value} decimals={decimals} />
                {unit && (
                    <span
                        className="text-sm ml-0.5"
                        style={{ color: `${accent}99`, fontFamily: "'Space Mono', monospace" }}
                    >
                        {unit}
                    </span>
                )}
            </div>
        </div>
    );
}

