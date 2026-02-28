<div align="center">

# 🧳 Grid Packer

**An interactive rectangle bin-packing solver inspired by the auto-organize attaché case feature from *Resident Evil 4* (2023 Remake).**

Built with **React 19 · TypeScript · Tailwind CSS v4 · Vite**

</div>

---

## ✨ About

In *Resident Evil 4 (2023)*, the player manages an attaché case — a grid-based inventory where items of different sizes must be arranged to fit. The game features an **auto-organize** button that instantly rearranges every item for optimal space usage.

This project recreates that concept as a standalone web application. You define a **father rectangle** (the case), add **items** of various sizes, and hit **Solve** — a backtracking algorithm finds the best possible arrangement, packing as many items as it can while maximizing coverage.

### Key Features

- 🔲 **Configurable grid** — set any height × width for the father rectangle
- 📦 **Dynamic item list** — add, remove, and resize items freely
- 🔄 **Rotation support** — items can be rotated 90° to fit better
- ⚡ **Time-budgeted solver** — 3-second deadline prevents freezing on large inputs; returns best-so-far if time runs out
- 🎨 **Color-coded visualization** — each item gets a unique color with staggered reveal animation
- 📊 **Live statistics** — coverage %, placed count, and squares filled with animated counters
- ⚠️ **Graceful degradation** — unplaced items are clearly listed; a warning appears if the solver timed out
- 📱 **Responsive layout** — adapts cell sizes via ResizeObserver

---

## 🏗️ Architecture

The project follows a clean, modular folder structure with clear separation of concerns:

```
src/
├── App.tsx                        # Root component — state management & layout composition
├── App.css                        # Tailwind CSS entry
├── main.tsx                       # React DOM entry point
│
├── types/
│   └── index.ts                   # All TypeScript interfaces (Item, PlacedItem, PackResult, etc.)
│
├── constants/
│   ├── index.ts                   # Barrel re-export
│   ├── colors.ts                  # Color palette & getColor() helper
│   └── solver.ts                  # Solver configuration (time budget)
│
├── logic/
│   ├── index.ts                   # Barrel re-export
│   ├── Grid.ts                    # Grid data structure (Uint8Array-backed)
│   └── solver.ts                  # Backtracking solver & pack() entry point
│
├── styles/
│   └── animations.css             # Keyframes, scrollbar, input resets, Google Fonts
│
└── components/
    ├── index.ts                   # Barrel re-export
    ├── BackgroundEffects.tsx       # Floating gradient orbs & scanline overlay
    ├── Header.tsx                  # App title & version badge
    ├── Footer.tsx                  # Footer with solver info
    ├── ConfigPanel.tsx             # Left panel — grid dimensions, items list, solve button
    ├── ResultsPanel.tsx            # Right panel — stats, grid viz, unplaced items, banners
    ├── GridViz.tsx                 # Grid visualization with cell reveal animation & legend
    ├── ItemRow.tsx                 # Single item input row with color badge
    └── ui/
        ├── index.ts               # Barrel re-export
        ├── AnimatedNumber.tsx      # Number with eased animation
        ├── StatCard.tsx            # Stat display card
        ├── SectionHeader.tsx       # Section header with accent bar
        ├── Panel.tsx               # Glass-morphism panel wrapper
        └── DimInput.tsx            # Numeric dimension input
```

**Design decisions:**
- **`logic/`** contains zero React dependencies — pure TypeScript algorithm code, easily testable in isolation
- **`types/`** centralizes all interfaces so any module can import from a single source
- **`components/ui/`** holds reusable, generic primitives; feature components live at the `components/` root

---

## 🛠️ Tech Stack

| Layer       | Technology                   |
|-------------|------------------------------|
| Framework   | React 19                     |
| Language    | TypeScript 5.9               |
| Styling     | Tailwind CSS v4              |
| Bundler     | Vite 7                       |
| Compiler    | React Compiler (Babel plugin)|
| Linting     | ESLint 9                     |

---

## 🧪 How to Test

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9 (or **yarn** / **pnpm**)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/re4-like-case-organizer.git
cd re4-like-case-organizer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run in development mode

```bash
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

### 4. Use the app

1. **Set the father rectangle** — adjust Height and Width in the top-left panel
2. **Add / edit items** — use the items list to add items, change their H×W dimensions, or remove them
3. **Hit "SOLVE PACKING"** — the solver will find the best arrangement within 3 seconds
4. **Review results** — see coverage stats, the color-coded grid, and any unplaced items

### 5. Test edge cases

| Scenario                               | Expected behavior                                                        |
|-----------------------------------------|--------------------------------------------------------------------------|
| More items than grid space              | Solver places as many as possible; unplaced items shown in red section   |
| Very large grid (e.g. 20×20) + many items | Solver runs up to 3s then returns best-so-far with a yellow "TIME LIMIT REACHED" warning |
| Single 1×1 item in a 1×1 grid          | Instant perfect pack — 100% coverage                                    |
| All items larger than the grid          | All items listed as unplaced; 0% coverage                               |
| Items that fit perfectly (no waste)     | "PERFECT PACK" banner shown with ✦ icon                                 |

### 6. Build for production

```bash
npm run build
npm run preview
```

---

## 📄 License

This project is for educational and portfolio purposes. *Resident Evil 4* is a trademark of CAPCOM. This project is not affiliated with or endorsed by CAPCOM.
