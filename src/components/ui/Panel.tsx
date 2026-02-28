import type { ReactNode } from 'react';

interface PanelProps {
    children: ReactNode;
    className?: string;
    /** Enable backdrop blur. Disable for panels with heavy content (e.g. large grids). */
    blur?: boolean;
}

/** Glass-morphism card container used as the primary layout wrapper. */
export function Panel({ children, className = "", blur = true }: PanelProps) {
    return (
        <div
            className={`rounded-[18px] p-5 ${className}`}
            style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: blur ? "blur(20px)" : "none",
            }}
        >
            {children}
        </div>
    );
}
