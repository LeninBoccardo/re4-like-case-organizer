import type { ItemColor } from '../types';

/**
 * Rotating palette of visually distinct colors for item visualization.
 * Each entry provides background, text contrast, and glow shadow values.
 */
export const ITEM_COLORS: ItemColor[] = [
    { bg: "#00f5d4", text: "#001a16", glow: "0 0 20px #00f5d480" },
    { bg: "#f72585", text: "#fff0f5", glow: "0 0 20px #f7258580" },
    { bg: "#ffd60a", text: "#1a1400", glow: "0 0 20px #ffd60a80" },
    { bg: "#4cc9f0", text: "#001a25", glow: "0 0 20px #4cc9f080" },
    { bg: "#7b2fff", text: "#f0eaff", glow: "0 0 20px #7b2fff80" },
    { bg: "#ff6b35", text: "#1a0a00", glow: "0 0 20px #ff6b3580" },
    { bg: "#06d6a0", text: "#001a10", glow: "0 0 20px #06d6a080" },
    { bg: "#ef233c", text: "#fff0f0", glow: "0 0 20px #ef233c80" },
    { bg: "#118ab2", text: "#001a25", glow: "0 0 20px #118ab280" },
    { bg: "#f9844a", text: "#1a0a00", glow: "0 0 20px #f9844a80" },
];

/** Returns the color scheme for a given item index, cycling through the palette. */
export function getColor(colorIndex: number): ItemColor {
    return ITEM_COLORS[Math.abs(colorIndex) % ITEM_COLORS.length];
}
