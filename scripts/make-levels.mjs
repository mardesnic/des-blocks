// Builds the level bank in src/levels/. Good sliding puzzles are
// rare among random layouts, and finding them takes minutes, too long to
// do on a phone, so they are found here once and shipped with the app.
//
//   node scripts/make-levels.mjs <difficulty> <count> <seconds>
//
// Each run replaces that difficulty's file.
import { writeFileSync } from 'node:fs';

const CONFIG = {
  tiny: { size: 5, blocks: [3, 5], long: 0.15, moves: [2, 4] },
  easy: { size: 6, blocks: [6, 9], long: 0.25, moves: [5, 9] },
  medium: { size: 6, blocks: [8, 11], long: 0.3, moves: [10, 16] },
  hard: { size: 6, blocks: [9, 13], long: 0.3, moves: [17, 99] },
};
const MAX_STATES = 400_000;

const [difficulty, count = '100', seconds = '600'] = process.argv.slice(2);
const cfg = CONFIG[difficulty];
if (!cfg) throw new Error(`difficulty is one of ${Object.keys(CONFIG)}`);
const { size } = cfg;
const exit = Math.floor((size - 1) / 2);
const between = ([lo, hi]) => lo + Math.floor(Math.random() * (hi - lo + 1));

// Blocks dropped at random, with the first block already out.
function scatter() {
  const blocks = [{ length: 2, across: true, line: exit }];
  const start = [size - 2];
  const taken = new Set([exit * size + size - 2, exit * size + size - 1]);
  const want = between(cfg.blocks);
  for (let tries = 0; blocks.length <= want && tries < 300; tries++) {
    const across = Math.random() < 0.5;
    const length = Math.random() < cfg.long ? 3 : 2;
    const line = Math.floor(Math.random() * size);
    if (across && line === exit) continue;
    const at = Math.floor(Math.random() * (size - length + 1));
    const cells = Array.from({ length }, (_, i) =>
      across ? line * size + at + i : (at + i) * size + line
    );
    if (cells.some((c) => taken.has(c))) continue;
    cells.forEach((c) => taken.add(c));
    blocks.push({ length, across, line });
    start.push(at);
  }
  return { blocks, start };
}

const pack = (p) => p.reduce((n, x) => n * size + x, 0);

function neighbours(blocks, p) {
  const g = new Int8Array(size * size).fill(-1);
  blocks.forEach((b, k) => {
    for (let i = 0; i < b.length; i++)
      g[b.across ? b.line * size + p[k] + i : (p[k] + i) * size + b.line] = k;
  });
  const out = [];
  blocks.forEach((b, k) => {
    const cell = (at) => (b.across ? b.line * size + at : at * size + b.line);
    for (let at = p[k] - 1; at >= 0 && g[cell(at)] < 0; at--)
      out.push(p.with(k, at));
    for (let at = p[k] + 1; at + b.length <= size; at++) {
      if (g[cell(at + b.length - 1)] >= 0) break;
      out.push(p.with(k, at));
    }
  });
  return out;
}

// Fewest slides to get out, from every position the layout can reach.
function distances(blocks, start) {
  const all = [start];
  const seen = new Set([pack(start)]);
  for (let i = 0; i < all.length; i++) {
    for (const q of neighbours(blocks, all[i])) {
      const key = pack(q);
      if (seen.has(key)) continue;
      if (seen.size >= MAX_STATES) return undefined;
      seen.add(key);
      all.push(q);
    }
  }
  const dist = new Map();
  let frontier = all.filter((p) => p[0] === size - 2);
  frontier.forEach((p) => dist.set(pack(p), [0, p]));
  for (let d = 1; frontier.length; d++) {
    const following = [];
    for (const p of frontier)
      for (const q of neighbours(blocks, p)) {
        const key = pack(q);
        if (dist.has(key)) continue;
        dist.set(key, [d, q]);
        following.push(q);
      }
    frontier = following;
  }
  return dist;
}

// One letter per block, A for the block to get out; '.' is empty.
function draw(blocks, p) {
  const cells = new Array(size * size).fill('.');
  blocks.forEach((b, k) => {
    for (let i = 0; i < b.length; i++)
      cells[b.across ? b.line * size + p[k] + i : (p[k] + i) * size + b.line] =
        String.fromCharCode(65 + k);
  });
  return cells.join('');
}

const found = new Map();
// Levels of each length of solution, so the bank isn't mostly the
// shortest kind; hard levels take whatever is found.
const quota = Math.ceil(Number(count) / (cfg.moves[1] - cfg.moves[0] + 1));
const perMoves = new Map();
const until = Date.now() + Number(seconds) * 1000;
while (found.size < Number(count) && Date.now() < until) {
  const { blocks, start } = scatter();
  const dist = distances(blocks, start);
  if (!dist) continue;
  // The farthest start this layout has, if it is in range; hard levels
  // want the most slides, the others a random number in range.
  const [lo, hi] = cfg.moves;
  const goal = difficulty === 'hard' ? hi : between(cfg.moves);
  let best;
  for (const [d, p] of dist.values()) {
    if (d < lo || d > goal) continue;
    if (!best || d > best[0]) best = [d, p];
  }
  if (!best) continue;
  const board = draw(blocks, best[1]);
  const n = perMoves.get(best[0]) ?? 0;
  if (found.has(board) || (difficulty !== 'hard' && n >= quota)) continue;
  found.set(board, best[0]);
  perMoves.set(best[0], n + 1);
}

const levels = [...found].sort((a, b) => a[1] - b[1]);
writeFileSync(
  new URL(`../src/levels/${difficulty}.json`, import.meta.url),
  `[\n${levels.map((l) => `  ${JSON.stringify(l)}`).join(',\n')}\n]\n`
);
console.log(
  difficulty,
  levels.length,
  'levels, slides',
  levels.map((l) => l[1]).join(' ')
);
