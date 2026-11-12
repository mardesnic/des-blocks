import {
  isOut,
  slide,
  type Difficulty,
  type Level,
  type Positions,
} from './blocks';

export type Game = {
  level: Level;
  positions: Positions;
  moves: number;
  solved: boolean;
};

export type Stats = { [D in Difficulty]: { solved: number } };

export const initialStats: Stats = {
  tiny: { solved: 0 },
  easy: { solved: 0 },
  medium: { solved: 0 },
  hard: { solved: 0 },
};

export const newGame = (level: Level): Game => ({
  level,
  positions: level.start,
  moves: 0,
  solved: false,
});

// One slide of one block, however far it goes, is one move.
export function withSlide(game: Game, k: number, to: number): Game {
  if (game.solved) return game;
  const positions = slide(game.level, game.positions, k, to);
  if (positions === game.positions) return game;
  return {
    ...game,
    positions,
    moves: game.moves + 1,
    solved: isOut(game.level, positions),
  };
}

export const recordWin = (stats: Stats, game: Game): Stats => ({
  ...stats,
  [game.level.difficulty]: { solved: stats[game.level.difficulty].solved + 1 },
});
