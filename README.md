# TripleCast Dice

TripleCast Dice is a one-page, fun-play dice betting game built with React 19, Vite, TypeScript, Tailwind 4, and React Three Fiber. It plays like a fast casino broadcast table: three dice roll on a TV-style 3D stage, players place session-credit bets before lockdown, and each round settles automatically.

This is not a real-money betting product. Everything is client-side and session-only. Refreshing the page resets the nickname, balance, bets, result history, and current round.

## What We Built

- Required nickname modal before entering the table.
- Starting balance of `5,000` session credits.
- Top app bar with nickname, balance, round number, phase, and countdown.
- Large 16:9 TV-style Three.js dice stage with three animated dice.
- Betting board with chip values `10`, `50`, `100`, `500`, and `1000`.
- Bet slip showing current bets, total stake, removable bets before lockdown, and settlement results.
- Round result summary with dice values, total, staked amount, payout, and net win/loss.
- Session-only history of recent completed rounds.
- Desktop and mobile responsive layouts.

## Game Flow

Each round runs automatically.

1. **Betting open**
   - Countdown starts at `60s`.
   - Bets are accepted from `60s` down to `11s`.
   - Dice shuffle continuously on the TV screen.
   - Stakes are deducted immediately when bets are placed.

2. **Lockdown**
   - Starts at `10s`.
   - No new bets can be placed.
   - Existing bets can no longer be removed.
   - Dice animation becomes tenser while the round waits to reveal.

3. **Dice open**
   - Starts when the countdown reaches `0s`.
   - The three dice settle into the generated result.
   - The app evaluates every bet against the final dice values.

4. **Settling**
   - Win/loss summary is shown for about `5s`.
   - Winning payouts are added back to the balance.
   - A history entry is created.
   - The next round starts automatically.

## What Players Are Betting On

The result comes from three six-sided dice. The app evaluates the final dice values, their total, parity, pairs, triples, and exact selected numbers.

| Bet | Win Condition | Payout |
| --- | --- | --- |
| Small | Total is `4-10`; any triple loses | `1:1` |
| Big | Total is `11-17`; any triple loses | `1:1` |
| Odd | Total is odd | `1:1` |
| Even | Total is even | `1:1` |
| Single number | Selected number appears on 1, 2, or 3 dice | `1:1`, `2:1`, or `3:1` |
| Any double | Any pair appears | `3:1` |
| Specific double | Selected pair appears, such as `4-4` | `8:1` |
| Any triple | Any three of a kind appears | `24:1` |
| Specific triple | Selected triple appears, such as `6-6-6` | `150:1` |
| Exact total | Final dice total matches the selected total from `4-17` | Rarity-based |

Exact total payouts:

| Total | Payout |
| --- | --- |
| `4` or `17` | `60:1` |
| `5` or `16` | `30:1` |
| `6` or `15` | `18:1` |
| `7` or `14` | `12:1` |
| `8` or `13` | `8:1` |
| `9` or `12` | `6:1` |
| `10` or `11` | `5:1` |

## Win And Loss Behavior

- A bet stake is deducted as soon as the bet is placed.
- If the bet wins, the app returns the stake plus profit.
- If the bet loses, the deducted stake is kept as the loss.
- The result summary shows total staked, total paid, and net win/loss.
- Winning rounds trigger a gold visual highlight and dice-stage sparkle effect.
- History records the round number, dice result, total, number of bets, and net result.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind 4 via `@tailwindcss/vite`
- Three.js through `@react-three/fiber`
- Drei helpers through `@react-three/drei`
- `lucide-react` for UI icons

## Local Development

Install dependencies:

```bash
bun install
```

Start the dev server:

```bash
bun run dev
```

Build for production:

```bash
bun run build
```

Run lint:

```bash
bun run lint
```

The app is designed to run locally at the Vite URL, typically:

```text
http://127.0.0.1:5173/
```

## Notes

- `SPEC.md` contains the tracking spec used for this implementation.
- The game intentionally does not use backend storage, auth, wallets, or account state.
- The current version uses procedural 3D dice and code-native UI, without generated raster assets.
