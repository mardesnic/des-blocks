import { useRef, useState } from 'react';

import { range, type Level, type Positions } from '../lib/blocks';
import { STAR, colourOf } from '../lib/colours';
import type { Strings } from '../lib/i18n';

// The board is drawn in board units: each cell is 1×1, with half a cell
// round the edge for the box and the way out.
const GAP = 0.06; // between neighbouring blocks, on each side

type Drag = {
  k: number;
  from: number; // where the block was when picked up
  start: number; // where the finger went down, in board units
  lo: number;
  hi: number;
  at: number; // where the block is now, between lo and hi
};

export function Board({
  level,
  positions,
  out,
  onSlide,
  t,
}: {
  level: Level;
  positions: Positions;
  out: boolean;
  onSlide: (k: number, to: number) => void;
  t: Strings;
}) {
  const { size, exit, blocks } = level;
  const ref = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<Drag>();

  // The finger's place along a block's line, in board units.
  const along = (e: React.PointerEvent, across: boolean) => {
    const box = ref.current!.getBoundingClientRect();
    return across
      ? ((e.clientX - box.left) / box.width) * (size + 1)
      : ((e.clientY - box.top) / box.height) * (size + 1);
  };

  const down = (e: React.PointerEvent, k: number) => {
    if (out || drag) return;
    ref.current!.setPointerCapture(e.pointerId);
    const [lo, hi] = range(level, positions, k);
    const from = positions[k];
    setDrag({ k, from, start: along(e, blocks[k].across), lo, hi, at: from });
  };

  const move = (e: React.PointerEvent) => {
    if (!drag) return;
    const moved = along(e, blocks[drag.k].across) - drag.start;
    const at = Math.min(drag.hi, Math.max(drag.lo, drag.from + moved));
    setDrag({ ...drag, at });
  };

  const up = () => {
    if (!drag) return;
    setDrag(undefined);
    onSlide(drag.k, Math.round(drag.at));
  };

  return (
    <svg
      ref={ref}
      className='board'
      viewBox={`-0.5 -0.5 ${size + 1} ${size + 1}`}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
    >
      <rect
        className='box'
        x={-0.22}
        y={-0.22}
        width={size + 0.44}
        height={size + 0.44}
        rx={0.3}
      />
      <rect className='floor' width={size} height={size} rx={0.12} />
      {Array.from({ length: size * size }, (_, cell) => (
        <rect
          key={cell}
          className='cell'
          x={(cell % size) + 0.1}
          y={Math.floor(cell / size) + 0.1}
          width={0.8}
          height={0.8}
          rx={0.12}
        />
      ))}

      {/* The way out: a gap in the box's wall, with an arrow past it. */}
      <rect
        className='floor'
        x={size - 0.1}
        y={exit + GAP}
        width={0.4}
        height={1 - GAP * 2}
      />
      <path
        className='exit'
        d={`M${size + 0.3} ${exit + 0.3} l0.18 0.2 -0.18 0.2`}
      />

      {blocks.map((block, k) => {
        const star = k === 0;
        // Once out, the star block carries on through the gap.
        const at =
          star && out ? size + 0.5 : drag?.k === k ? drag.at : positions[k];
        const x = block.across ? at : block.line;
        const y = block.across ? block.line : at;
        const w = (block.across ? block.length : 1) - GAP * 2;
        const h = (block.across ? 1 : block.length) - GAP * 2;
        const classes = [
          'block',
          drag?.k === k && 'block--dragging',
          star && out && 'block--out',
        ].filter(Boolean);
        return (
          <g
            key={k}
            className={classes.join(' ')}
            style={{
              transform: `translate(${x + GAP}px, ${y + GAP}px)`,
              color: star ? STAR : colourOf(k),
            }}
            onPointerDown={(e) => down(e, k)}
            role='img'
            aria-label={star ? t.star : t.block}
          >
            <rect
              className='block__shadow'
              y={0.06}
              width={w}
              height={h}
              rx={0.16}
            />
            <rect className='block__face' width={w} height={h} rx={0.16} />
            <rect
              className='block__shine'
              x={0.1}
              y={0.08}
              width={w - 0.2}
              height={0.12}
              rx={0.06}
            />
            {star ? (
              <path
                className='block__star'
                transform={`translate(${w / 2} ${h / 2}) scale(0.3)`}
                d='M0-1 .29-.4.95-.31.48.15.59.81 0 .5-.59.81-.48.15-.95-.31-.29-.4Z'
              />
            ) : (
              // A groove along the block, to show which way it slides.
              <line
                className='block__groove'
                x1={block.across ? 0.35 : w / 2}
                y1={block.across ? h / 2 : 0.35}
                x2={block.across ? w - 0.35 : w / 2}
                y2={block.across ? h / 2 : h - 0.35}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
