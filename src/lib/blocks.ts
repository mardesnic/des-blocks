import easy from '../levels/easy.json';
import hard from '../levels/hard.json';
import medium from '../levels/medium.json';
import tiny from '../levels/tiny.json';

export const DIFFICULTIES = ['tiny', 'easy', 'medium', 'hard'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

// A block slides only along its length: across (left and right) or down
// (up and down).
export type Block = { length: number; across: boolean; line: number };

export type Level = {
  difficulty: Difficulty;
  size: number;
  exit: number; // the row with the way out, on the right-hand side
  blocks: Block[]; // the first one is the block to get out
  start: Positions;
  moves: number; // fewest slides that get it out, for tests
  board: string; // as written in the bank
};

// Where each block is along its line: its leftmost column for a block
// across, its top row for a block down.
export type Positions = number[];

export const cellsOf = (level: Level, positions: Positions, k: number) => {
  const { length, across, line } = level.blocks[k];
  return Array.from({ length }, (_, i) =>
    across
      ? line * level.size + positions[k] + i
      : (positions[k] + i) * level.size + line
  );
};

// Which block covers each cell, or -1.
function grid(level: Level, positions: Positions) {
  const g = new Array<number>(level.size * level.size).fill(-1);
  level.blocks.forEach((_, k) => {
    for (const cell of cellsOf(level, positions, k)) g[cell] = k;
  });
  return g;
}

// How far a block can slide each way: the lowest and highest position it
// can reach without passing through another block.
export function range(level: Level, positions: Positions, k: number) {
  const { size } = level;
  const { length, across, line } = level.blocks[k];
  const g = grid(level, positions);
  const free = (at: number) =>
    g[across ? line * size + at : at * size + line] === -1;
  let lo = positions[k];
  let hi = positions[k];
  while (lo > 0 && free(lo - 1)) lo--;
  while (hi + length < size && free(hi + length)) hi++;
  return [lo, hi] as const;
}

// Slides a block to a position. Returns the same positions when it can't
// get there.
export function slide(
  level: Level,
  positions: Positions,
  k: number,
  to: number
): Positions {
  const [lo, hi] = range(level, positions, k);
  if (to === positions[k] || to < lo || to > hi) return positions;
  return positions.with(k, to);
}

// Out once the first block reaches the right-hand edge, at the way out.
export const isOut = (level: Level, positions: Positions) =>
  positions[0] + level.blocks[0].length === level.size;

// Every position one slide away: each block, each way, any distance.
function next(level: Level, positions: Positions) {
  const out: Positions[] = [];
  level.blocks.forEach((_, k) => {
    const [lo, hi] = range(level, positions, k);
    for (let to = lo; to <= hi; to++) {
      if (to !== positions[k]) out.push(positions.with(k, to));
    }
  });
  return out;
}

// Fewest slides that get the first block out, or -1 when it can't get out.
export function fewestMoves(level: Level, from = level.start) {
  const seen = new Set([from.join()]);
  let frontier = [from];
  for (let d = 0; frontier.length; d++) {
    const following: Positions[] = [];
    for (const p of frontier) {
      if (isOut(level, p)) return d;
      for (const q of next(level, p)) {
        const key = q.join();
        if (!seen.has(key)) {
          seen.add(key);
          following.push(q);
        }
      }
    }
    frontier = following;
  }
  return -1;
}

// One letter per block, A for the block to get out, '.' for an empty
// cell, row by row.
export function parse(
  difficulty: Difficulty,
  board: string,
  moves: number
): Level {
  const size = Math.sqrt(board.length);
  const cells = new Map<string, number[]>();
  [...board].forEach((ch, cell) => {
    if (ch !== '.') cells.set(ch, [...(cells.get(ch) ?? []), cell]);
  });
  const blocks: Block[] = [];
  const start: Positions = [];
  for (const ch of [...cells.keys()].sort()) {
    const [first, second] = cells.get(ch)!;
    const across = second === first + 1;
    const row = Math.floor(first / size);
    const col = first % size;
    blocks.push({
      length: cells.get(ch)!.length,
      across,
      line: across ? row : col,
    });
    start.push(across ? col : row);
  }
  return {
    difficulty,
    size,
    exit: blocks[0].line,
    blocks,
    start,
    moves,
    board,
  };
}

type Rng = () => number;

// Made by scripts/make-levels.mjs: each level's board and fewest slides.
export const LEVELS = { tiny, easy, medium, hard } as Record<
  Difficulty,
  [string, number][]
>;

// A random level from the bank. Never the one just played.
export function pick(difficulty: Difficulty, rng: Rng, previous?: Level) {
  const bank = LEVELS[difficulty];
  for (;;) {
    const [board, moves] = bank[Math.floor(rng() * bank.length)];
    const level = parse(difficulty, board, moves);
    if (!previous || previous.board !== board) return level;
  }
}
