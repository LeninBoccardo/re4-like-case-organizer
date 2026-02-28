import './App.css';
import './styles/animations.css';
import { useState, useCallback } from 'react';
import { uid } from 'uid';

import type { Item, PackResult } from './types';
import { pack } from './logic';
import { BackgroundEffects, Header, Footer, ConfigPanel, ResultsPanel } from './components';

export default function App() {
    const [fatherH, setFatherH] = useState(4);
    const [fatherW, setFatherW] = useState(6);
    const [items, setItems] = useState<Item[]>([
        { id: uid(), h: 2, w: 3 },
        { id: uid(), h: 1, w: 3 },
        { id: uid(), h: 1, w: 5 },
        { id: uid(), h: 3, w: 2 },
        { id: uid(), h: 3, w: 1 },
    ]);
    const [result, setResult] = useState<PackResult | null>(null);
    const [solving, setSolving] = useState(false);
    const [animKey, setAnimKey] = useState(0);

    const handleSolve = useCallback(() => {
        setSolving(true);
        setResult(null);
        setTimeout(() => {
            const r = pack(fatherH, fatherW, items);
            setResult(r);
            setAnimKey((k) => k + 1);
            setSolving(false);
        }, 400);
    }, [fatherH, fatherW, items]);

    const addItem = useCallback(() => {
        setItems((prev) => [...prev, { id: uid(), h: 1, w: 1 }]);
    }, []);

    const updateItem = useCallback((index: number, field: "h" | "w", value: number) => {
        setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
    }, []);

    const removeItem = useCallback((index: number) => {
        setItems((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const totalItemArea = items.reduce((s, i) => s + i.h * i.w, 0);
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
                fontFamily: "'Space Mono', monospace",
            }}
        >
            <BackgroundEffects />

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

