import {SOLVE_TIME_BUDGET_MS} from '../constants';

export function Footer() {
    return (
        <footer
            className="shrink-0 text-center py-2 text-[10px] tracking-widest"
            style={{color: "#1e1e1e", fontFamily: "'Space Mono', monospace"}}
        >
            BACKTRACKING SOLVER · {SOLVE_TIME_BUDGET_MS / 1000}s TIME BUDGET · ROTATION ENABLED
        </footer>
    );
}

