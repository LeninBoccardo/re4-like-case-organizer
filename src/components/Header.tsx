import { FONT_DISPLAY } from '../constants';

/** App header with version badge, title, and subtitle. */
export function Header() {
    return (
        <header
            className="shrink-0 flex flex-col items-center pt-5 pb-3 px-6"
            style={{ animation: "fadeUp 0.6s ease both" }}
        >
            <div
                className="flex items-center gap-2.5 px-4 py-1.5 rounded-full mb-3"
                style={{ background: "rgba(0,245,212,0.08)", border: "1px solid rgba(0,245,212,0.2)" }}
            >
                <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "#00f5d4", animation: "pulse 2s ease infinite" }}
                />
                <span className="text-[10px] tracking-[0.15em]" style={{ color: "#00f5d4" }}>
                    GRID PACKER v0.1
                </span>
            </div>

            <h1
                className="leading-none mb-1 tracking-tight"
                style={{
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 800,
                    fontSize: "clamp(26px, 4vw, 44px)",
                    color: "#00f5d4",
                    animation: "glow 3s ease-in-out infinite",
                }}
            >
                GRID PACKER
            </h1>
            <p className="text-[10px] tracking-[0.06em]" style={{ color: "#444" }}>
                optimal rectangle packing · backtracking solver · rotation support
            </p>
        </header>
    );
}
