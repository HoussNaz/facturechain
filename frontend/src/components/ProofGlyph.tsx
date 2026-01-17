import { useMemo } from "react";

const palette = ["#1e3a5f", "#1f9d55", "#f59e0b", "#0f766e", "#be123c"];

const toBytes = (value: string) => {
  const clean = value.replace(/^0x/, "").padEnd(32, "0");
  const bytes: number[] = [];
  for (let i = 0; i < clean.length; i += 2) {
    const pair = clean.slice(i, i + 2);
    bytes.push(Number.parseInt(pair, 16) || 0);
  }
  return bytes.length ? bytes : [0];
};

const buildPattern = (hash: string, cols = 8, rows = 8) => {
  const bytes = toBytes(hash || "00");
  const half = Math.ceil(cols / 2);
  const cells = new Array(rows * cols).fill(false);

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < half; col += 1) {
      const idx = (row * half + col) % bytes.length;
      const on = (bytes[idx] + row + col) % 3 === 0;
      const left = row * cols + col;
      const right = row * cols + (cols - 1 - col);
      cells[left] = on;
      cells[right] = on;
    }
  }

  const color = palette[bytes[0] % palette.length];
  return { cells, color, cols, rows };
};

type ProofGlyphProps = {
  hash?: string | null;
  size?: number;
  label?: string;
  caption?: string;
};

export default function ProofGlyph({ hash, size = 96, label, caption }: ProofGlyphProps) {
  const pattern = useMemo(() => buildPattern(hash || "00"), [hash]);

  return (
    <div className="flex items-center gap-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <div
          className="grid gap-[2px]"
          style={{
            gridTemplateColumns: `repeat(${pattern.cols}, minmax(0, 1fr))`,
            width: size,
            height: size
          }}
        >
          {pattern.cells.map((filled, index) => (
            <span
              key={`cell-${index}`}
              className="block rounded-[2px]"
              style={{
                backgroundColor: filled ? pattern.color : "rgba(148, 163, 184, 0.2)"
              }}
            />
          ))}
        </div>
      </div>
      {(label || caption) && (
        <div>
          {label && <p className="text-sm font-semibold text-slate-800">{label}</p>}
          {caption && <p className="text-xs text-slate-500">{caption}</p>}
        </div>
      )}
    </div>
  );
}
