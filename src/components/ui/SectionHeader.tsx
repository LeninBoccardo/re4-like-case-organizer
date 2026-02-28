import type { ReactNode } from 'react';

interface SectionHeaderProps {
    label: string;
    accent: string;
    right?: ReactNode;
}

export function SectionHeader({ label, accent, right }: SectionHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-4 shrink-0">
            <div className="flex items-center gap-2.5">
                <div
                    className="w-0.5 rounded-sm shrink-0"
                    style={{ height: 18, background: accent, boxShadow: `0 0 8px ${accent}` }}
                />
                <span
                    className="text-[11px] font-bold tracking-[0.12em]"
                    style={{ color: accent, fontFamily: "'Space Mono', monospace" }}
                >
                    {label}
                </span>
            </div>
            {right}
        </div>
    );
}

