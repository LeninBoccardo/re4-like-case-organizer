import { useState, useEffect } from 'react';
import { FONT_MONO } from '../constants';

/** Threshold (ms) before the loading overlay becomes visible. */
const LOADING_VISIBLE_DELAY_MS = 500;

interface SolvingOverlayProps {
    /** Whether the solver is currently running. */
    solving: boolean;
}

/** Full-screen loading overlay that fades in only after a delay, avoiding flicker on fast solves. */
export function SolvingOverlay({ solving }: SolvingOverlayProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!solving) {
            setVisible(false);
            return;
        }

        const timer = setTimeout(() => setVisible(true), LOADING_VISIBLE_DELAY_MS);
        return () => clearTimeout(timer);
    }, [solving]);

    if (!visible) return null;

    return (
        <div
            className="fixed inset-0 z-40 flex flex-col items-center justify-center"
            style={{
                background: "rgba(5, 5, 8, 0.85)",
                backdropFilter: "blur(8px)",
                animation: "fadeUp 0.3s ease both",
            }}
        >
            {/* Spinner ring */}
            <div
                style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    border: "3px solid rgba(0,245,212,0.15)",
                    borderTopColor: "#00f5d4",
                    animation: "spin 0.8s linear infinite",
                }}
            />

            {/* Label */}
            <div
                className="mt-5 text-sm font-bold tracking-[0.15em]"
                style={{ color: "#00f5d4", fontFamily: FONT_MONO }}
            >
                SOLVING...
            </div>
            <div
                className="mt-1.5 text-[10px] tracking-widest"
                style={{ color: "#555", fontFamily: FONT_MONO }}
            >
                searching for optimal arrangement
            </div>

            {/* Pulsing dots */}
            <div className="flex gap-1.5 mt-4">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#00f5d4",
                            animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

