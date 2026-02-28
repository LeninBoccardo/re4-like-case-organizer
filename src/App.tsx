import './App.css';
import './styles/animations.css';
import { useState, useCallback } from 'react';
import { uid } from 'uid';

import type { Item, DimensionField, PackResult } from './types';
import { FONT_MONO } from './constants';
import { pack } from './logic';
import { BackgroundEffects, Header, Footer, ConfigPanel, ResultsPanel, SolvingOverlay } from './components';

/** Delay (ms) before solving starts — gives the UI time to show the loading state. */
const SOLVE_DEBOUNCE_MS = 400;

/** Default items preloaded into the app for demo purposes. */
const DEFAULT_ITEMS: Item[] = [
    { id: uid(), h: 2, w: 3 },
    { id: uid(), h: 1, w: 3 },
    { id: uid(), h: 1, w: 5 },
    { id: uid(), h: 3, w: 2 },
    { id: uid(), h: 3, w: 1 },
];

/** Root application component — manages state and composes layout sections. */
export default function App() {
    const [fatherH, setFatherH] = useState(4);
    const [fatherW, setFatherW] = useState(6);
    const [items, setItems] = useState<Item[]>(DEFAULT_ITEMS);
    const [result, setResult] = useState<PackResult | null>(null);
    const [solving, setSolving] = useState(false);
    const [animKey, setAnimKey] = useState(0);

    const handleSolve = useCallback(() => {
        setSolving(true);
        setResult(null);
        setTimeout(() => {
            setResult(pack(fatherH, fatherW, items));
            setAnimKey((k) => k + 1);
            setSolving(false);
        }, SOLVE_DEBOUNCE_MS);
    }, [fatherH, fatherW, items]);

    const addItem = useCallback(() => {
        setItems((prev) => [...prev, { id: uid(), h: 1, w: 1 }]);
    }, []);

    const updateItem = useCallback((index: number, field: DimensionField, value: number) => {
        setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
    }, []);

    const removeItem = useCallback((index: number) => {
        setItems((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const totalItemArea = items.reduce((sum, item) => sum + item.h * item.w, 0);
    const fatherArea = fatherH * fatherW;

    return (
        <div
            className="w-screen h-screen flex flex-col overflow-hidden text-white"
            style={{
                background: "#050508",
                backgroundImage: `
                    radial-gradient(ellipse 80% 50% at 20% 10%, rgba(0,245,212,0.06) 0%, transparent 60%),
                    radial-gradient(ellipse 60% 40% at 80% 80%, rgba(123,47,255,0.07) 0%, transparent 60%),
                    radial-gradient(ellipse 50% 60% at 50% 50%, rgba(247,37,133,0.03) 0%, transparent 70%),
                    url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 0v40M40 0v40M0 0h40M0 40h40' stroke='%23ffffff07' stroke-width='.5'/%3E%3C/svg%3E")
                `,
                fontFamily: FONT_MONO,
            }}
        >
            <BackgroundEffects />
            <SolvingOverlay solving={solving} />

            <Header />

            <main className="flex-1 flex flex-col lg:flex-row gap-3 px-4 pb-3 lg:px-5 lg:pb-4 overflow-hidden min-h-0">
                <ConfigPanel
                    fatherH={fatherH}
                    fatherW={fatherW}
                    fatherArea={fatherArea}
                    items={items}
                    totalItemArea={totalItemArea}
                    solving={solving}
                    onFatherHChange={setFatherH}
                    onFatherWChange={setFatherW}
                    onItemChange={updateItem}
                    onItemRemove={removeItem}
                    onItemAdd={addItem}
                    onSolve={handleSolve}
                />

                <ResultsPanel
                    result={result}
                    items={items}
                    fatherH={fatherH}
                    fatherW={fatherW}
                    animKey={animKey}
                />
            </main>

            <Footer />
        </div>
    );
}
