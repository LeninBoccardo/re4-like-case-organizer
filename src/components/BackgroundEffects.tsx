/** Decorative floating gradient orbs and CRT-style scanline overlay. */
export function BackgroundEffects() {
    return (
        <>
            {/* Animated background orbs */}
            <div
                className="fixed pointer-events-none -z-10"
                style={{
                    width: 600,
                    height: 600,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(0,245,212,0.05) 0%, transparent 70%)",
                    top: -200,
                    left: -200,
                    animation: "float1 12s ease-in-out infinite",
                }}
            />
            <div
                className="fixed pointer-events-none -z-10"
                style={{
                    width: 500,
                    height: 500,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(247,37,133,0.05) 0%, transparent 70%)",
                    bottom: -150,
                    right: -100,
                    animation: "float2 15s ease-in-out infinite",
                }}
            />

            {/* Scanline */}
            <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        height: 2,
                        background: "linear-gradient(transparent, rgba(0,245,212,0.03), transparent)",
                        animation: "scanline 8s linear infinite",
                    }}
                />
            </div>
        </>
    );
}
