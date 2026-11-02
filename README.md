# The Phantom Stack

A playable bluffing card game for one human and two AI opponents, built with React, Tailwind CSS, Lucide icons, and Vite.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

## Build and test

```sh
npm test
npm run build
```

## Play

Select 1–4 cards to claim the current rank, or pass. Every play opens a five-second challenge window. A caught bluffer takes the entire stack; a false challenger takes it instead. Three consecutive passes remove the stack permanently. Empty your hand and survive the final challenge to win.

Three standard decks are shuffled, 24 cards are secretly removed, and each player receives 44 cards. New rounds default to the next rank, but their starting player may choose another rank. Full rules are available inside the game.

Game logic lives in `src/game.js`, with state-transition and simulated-game tests in `src/game.test.js`. The interface and revision-guarded timers live in `src/main.jsx`.
