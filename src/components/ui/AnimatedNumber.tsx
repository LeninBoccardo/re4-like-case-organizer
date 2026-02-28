import { useState, useEffect, useRef } from 'react';

interface AnimatedNumberProps {
    value: number;
    decimals?: number;
}

export function AnimatedNumber({ value, decimals = 0 }: AnimatedNumberProps) {
    const [display, setDisplay] = useState(0);
    const raf = useRef<number | undefined>(undefined);
    const prevRef = useRef(0);

    useEffect(() => {
        const start = performance.now();
        const from = prevRef.current;
        const to = value;
        const dur = 800;

        function step(now: number) {
            const t = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - t, 4);
            const cur = from + (to - from) * ease;
            setDisplay(cur);
            if (t < 1) raf.current = requestAnimationFrame(step);
            else prevRef.current = to;
        }

        raf.current = requestAnimationFrame(step);
        return () => {
            if (raf.current) cancelAnimationFrame(raf.current);
        };
    }, [value]);

    return <>{display.toFixed(decimals)}</>;
}

