import { useState, useEffect, useRef } from 'react';
import { ANIMATED_NUMBER_DURATION_MS } from '../../constants';

interface AnimatedNumberProps {
    value: number;
    decimals?: number;
}

/** Displays a number that smoothly animates between value changes. */
export function AnimatedNumber({ value, decimals = 0 }: AnimatedNumberProps) {
    const [display, setDisplay] = useState(0);
    const rafRef = useRef<number | undefined>(undefined);
    const prevRef = useRef(0);

    useEffect(() => {
        const start = performance.now();
        const from = prevRef.current;
        const to = value;

        function step(now: number) {
            const t = Math.min((now - start) / ANIMATED_NUMBER_DURATION_MS, 1);
            const ease = 1 - Math.pow(1 - t, 4);
            setDisplay(from + (to - from) * ease);

            if (t < 1) rafRef.current = requestAnimationFrame(step);
            else prevRef.current = to;
        }

        rafRef.current = requestAnimationFrame(step);
        return () => {
            if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
        };
    }, [value]);

    return <>{display.toFixed(decimals)}</>;
}
