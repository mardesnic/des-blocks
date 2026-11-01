# Blocks

A free sliding block puzzle for young kids that works offline. The star block is stuck in a box full of other blocks. Slide the blocks out of the way until the star block can get out through the gap in the side.

Made for ages 5 and up. There is no timer and no way to lose. Undo takes back the last move, and Start over puts the blocks back where they began.

## Demo

Check out the live demo at: https://mardesnic.github.io/des-blocks/

On your phone, open it and choose **Add to Home Screen** (Safari) or **Install app** (Chrome). It then opens like an app and works offline.

## Features

- Over 100 levels at each of four levels of difficulty:
  - **Very easy**: a 5×5 box, out in 2 to 4 moves
  - **Easy**: a 6×6 box, out in 5 to 9 moves
  - **Medium**: a 6×6 box, out in 10 to 16 moves
  - **Hard**: a 6×6 box, 17 moves or more
- Blocks only slide the way they point; one slide is one move, however far it goes
- Every level can be solved
- The next level is never the one just played
- A count of levels solved at each difficulty
- Picks up where you left off after a reload
- Keeps the screen on while you play
- In English and Croatian, following the phone's language unless you pick one
- Light and dark mode
- No ads, accounts or tracking

## Development

```bash
npm install
npm run dev        # local dev server
npm test           # level and translation tests
npm run build      # production build in dist/
```

`npm run deploy` builds the app and publishes it to GitHub Pages.

The levels live in `src/levels/`. Good puzzles are rare among random layouts and take minutes to find, too long for a phone, so `scripts/make-levels.mjs` finds them once and they ship with the app. To make a new set for one difficulty:

```bash
node scripts/make-levels.mjs hard 150 600   # difficulty, how many, seconds to search
```
