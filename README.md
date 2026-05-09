# TripleCast Royale

TripleCast Royale is a one-page, fun-play Sic Bo-style dice betting game built with React 19, Vite, TypeScript, Tailwind 4, and React Three Fiber. It plays like a fast live casino table: three dice roll on a TV-style 3D stage, the table cover closes, players place session-credit bets during countdown, and each round settles automatically.

This is not a real-money betting product. Everything is client-side and session-only. Refreshing the page resets the nickname, balance, bets, result history, and current round.

## What We Built

- Required nickname modal before entering the table.
- Starting balance of `5,000` session credits.
- Top app bar with nickname, balance, round number, and a history icon.
- Compact top TV-style Three.js dice stage sized as a broadcast strip instead of a full hero.
- Cinematic countdown displayed directly over the dice area during betting.
- Red pulse and tick-tock sound cue during the final `10s` of countdown.
- Casino-style cover that closes over the dice while bets are open.
- Large dice-stage result overlay that announces the final values as `x x x` plus the total.
- Brighter jewel-casino styling with distinct bet colors for Small, Big, Odd, Even, Singles, Doubles, Triples, and exact totals.
- Betting board with chip values `10`, `50`, `100`, `500`, and `1000`.
- Bet slip showing current bets, total stake, removable bets before lockdown, and settlement results.
- Round result summary with dice values, total, staked amount, payout, and net win/loss.
- Session-only history popover for recent completed rounds.
- Desktop and mobile responsive layouts.

## Game Flow

Each round runs automatically.

1. **Idle cooldown**
   - Short reset window before the next game starts.
   - Dice are still and betting is closed.
   - The previous result summary remains visible briefly while the table resets.

2. **Start rolling**
   - Dice roll on the TV screen for about `10s`.
   - Betting is still closed.
   - When rolling finishes, the dice stop and the casino-style cover closes over them.

3. **Countdown**
   - Countdown starts at `60s`.
   - Bets are accepted during this phase only.
   - Stakes are deducted immediately when bets are placed.
   - The dice stay covered and stationary.

4. **Lockdown**
   - No new bets can be placed.
   - Existing bets can no longer be removed.
   - The covered dice wait briefly before reveal.

5. **Dice open**
   - The cover opens and the final dice result is shown.
   - The app evaluates every bet against the final dice values.

6. **Settling**
   - Win/loss summary is shown for about `5s`.
   - Winning payouts are added back to the balance.
   - A history entry is created.
   - The game returns to idle cooldown and the next round starts automatically.

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
- Winning rounds trigger a gold visual highlight, result overlay emphasis, and dice-stage sparkle effect.
- The app-bar history icon opens a popover with recent rounds.
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
- The main desktop table is designed to fit in one viewport so players can see dice, result, slip, and betting options together.
