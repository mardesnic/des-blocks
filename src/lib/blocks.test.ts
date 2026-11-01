import { describe, expect, it } from 'vitest';

import {
  DIFFICULTIES,
  cellsOf,
  fewestMoves,
  isOut,
  LEVELS,
  parse,
  pick,
  range,
  slide,
} from './blocks';

// Deterministic stand-in for Math.random.
function seeded(seed = 1) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

// A 5×5 box, the way out on the right of the middle row:
//   . D D . .
//   . . B . .
//   A A B . .   →
//   . C C . .
//   . . . . .
// B is stuck between D and C, so one of them moves first, then B, then A.
const sample = parse('tiny', '.DD....B..AAB...CC.......', 3);

describe('parse', () => {
  it('reads blocks, which way they lie and where they are', () => {
    expect(sample.size).toBe(5);
    expect(sample.exit).toBe(2);
    expect(sample.blocks).toEqual([
      { length: 2, across: true, line: 2 },
      { length: 2, across: false, line: 2 },
      { length: 2, across: true, line: 3 },
      { length: 2, across: true, line: 0 },
    ]);
    expect(sample.start).toEqual([0, 1, 1, 1]);
  });

  it('finds the cells each block covers', () => {
    expect(cellsOf(sample, sample.start, 1)).toEqual([7, 12]);
    expect(cellsOf(sample, sample.start, 2)).toEqual([16, 17]);
  });
});

describe('sliding', () => {
  it('slides as far as the next block or the wall', () => {
    expect(range(sample, sample.start, 0)).toEqual([0, 0]);
    expect(range(sample, sample.start, 1)).toEqual([1, 1]);
    expect(range(sample, sample.start, 2)).toEqual([0, 3]);
  });

  it('slides any distance in one go', () => {
    expect(slide(sample, sample.start, 2, 3)).toEqual([0, 1, 3, 1]);
  });

  it('does not pass through a block', () => {
    expect(slide(sample, sample.start, 0, 3)).toBe(sample.start);
  });

  it('gets the block out at the right-hand wall', () => {
    let p = slide(sample, sample.start, 2, 3);
    p = slide(sample, p, 1, 3);
    expect(isOut(sample, p)).toBe(false);
    p = slide(sample, p, 0, 3);
    expect(isOut(sample, p)).toBe(true);
  });

  it('counts the fewest slides', () => {
    expect(fewestMoves(sample)).toBe(3);
  });
});

describe('levels', () => {
  it('grow from 5×5 to 6×6, with more slides each step', () => {
    let most = 0;
    for (const d of DIFFICULTIES) {
      const levels = LEVELS[d].map(([b, m]) => parse(d, b, m));
      expect(levels.length).toBeGreaterThanOrEqual(100);
      for (const level of levels) {
        expect(level.size).toBe(d === 'tiny' ? 5 : 6);
        expect(level.moves).toBeGreaterThan(most);
      }
      most = Math.max(...levels.map((l) => l.moves));
    }
  });

  it('are all different', () => {
    for (const d of DIFFICULTIES) {
      const boards = LEVELS[d].map(([b]) => b);
      expect(new Set(boards).size).toBe(boards.length);
    }
  });

  it('start with the star block across the exit row, not yet out', () => {
    for (const d of DIFFICULTIES) {
      for (const [b, m] of LEVELS[d]) {
        const level = parse(d, b, m);
        expect(level.blocks[0]).toMatchObject({ length: 2, across: true });
        expect(isOut(level, level.start)).toBe(false);
      }
    }
  });

  it('take exactly the slides the bank says', () => {
    for (const d of DIFFICULTIES) {
      const rng = seeded(7);
      for (let n = 0; n < 8; n++) {
        const level = pick(d, rng);
        expect(fewestMoves(level)).toBe(level.moves);
      }
    }
  });

  it('never repeat the level just played', () => {
    for (const d of DIFFICULTIES) {
      const rng = seeded(3);
      let level = pick(d, rng);
      for (let n = 0; n < 100; n++) {
        const next = pick(d, rng, level);
        expect(next.board).not.toBe(level.board);
        level = next;
      }
    }
  });
});
